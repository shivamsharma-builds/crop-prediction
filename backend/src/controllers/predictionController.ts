import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { predictionInputSchema } from "../utils/validation.js";
import { getOpenRouterSettings } from "../services/configService.js";
import { runCropGraph } from "../ai/graph.js";
import { Prediction } from "../models/Prediction.js";

export async function createPrediction(req: AuthRequest, res: Response) {
  const input = predictionInputSchema.parse(req.body);
  const settings = await getOpenRouterSettings();
  if (!settings.isAiEnabled) return res.status(503).json({ message: "AI predictions are currently disabled by an administrator" });
  const result = await runCropGraph(input);
  const prediction = await Prediction.create({
    userId: req.user?.id || null,
    inputs: input,
    recommendedCrop: result.recommendedCrop,
    confidenceScore: result.confidenceScore,
    aiAnalysis: { ...result, model: settings.selectedModel }
  });
  return res.status(201).json({ prediction: { id: String(prediction._id), ...result, createdAt: prediction.createdAt } });
}

export async function myPredictions(req: AuthRequest, res: Response) {
  const predictions = await Prediction.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(20).lean();
  return res.json({ predictions });
}


type Coordinates = { latitude: number; longitude: number; displayName: string };

async function geocodeLocation(location: string): Promise<Coordinates> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`;
  const response = await fetch(url, { headers: { "User-Agent": "CropWise/1.0 (crop prediction app)" } });
  if (!response.ok) throw new Error(`Geocoding failed (${response.status})`);
  const rows = await response.json() as Array<{ lat: string; lon: string; display_name: string }>;
  if (!rows.length) throw new Error("Location not found. Try a more specific place name or address.");
  const firstRow = rows[0];

if (!firstRow) {
  throw new Error("Location not found");
}

return {
  latitude: Number(firstRow.lat),
  longitude: Number(firstRow.lon),
  displayName: firstRow.display_name,
};
}

function numberFromSoilGrids(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    for (const key of ["mean", "value", "val"]) {
      if (typeof v[key] === "number" && Number.isFinite(v[key] as number)) return v[key] as number;
    }
  }
  return null;
}

function extractProperty(data: any, property: string): number | null {
  const layers = data?.properties?.layers;
  if (Array.isArray(layers)) {
    const layer = layers.find((item: any) => item?.name === property);
    const depth = layer?.depths?.[0];
    if (depth?.values) return numberFromSoilGrids(depth.values);
    if (depth?.values?.mean != null) return numberFromSoilGrids(depth.values.mean);
  }
  const direct = data?.properties?.[property];
  return numberFromSoilGrids(direct);
}

function classifyTexture(sand: number | null, clay: number | null): string {
  if (sand == null || clay == null) return "Unknown";
  if (clay >= 40) return "Clay";
  if (sand >= 70) return clay < 15 ? "Sandy" : "Sandy loam";
  if (clay >= 27) return "Clay loam";
  if (sand >= 50) return "Loam";
  return "Silt loam / Loam";
}

export async function getSiteData(req: Request, res: Response) {
  const body = req.body as { location?: string; latitude?: number; longitude?: number };
  let coordinates: Coordinates;

  if (Number.isFinite(body.latitude) && Number.isFinite(body.longitude)) {
    coordinates = {
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      displayName: body.location || `Coordinates: ${Number(body.latitude).toFixed(5)}, ${Number(body.longitude).toFixed(5)}`
    };
  } else if (typeof body.location === "string" && body.location.trim()) {
    coordinates = await geocodeLocation(body.location.trim());
  } else {
    return res.status(400).json({ message: "Provide a location or latitude/longitude." });
  }

  const { latitude, longitude } = coordinates;
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&past_days=30&forecast_days=1&hourly=temperature_2m,relative_humidity_2m,rain&timezone=auto`;

  const soilUrl =
    `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}` +
    `&property=phh2o&property=nitrogen&property=clay&property=sand&property=silt&property=bdod` +
    `&depth=0-5cm&value=mean`;

  const classificationUrl =
    `https://rest.isric.org/soilgrids/v2.0/classification/query?lon=${longitude}&lat=${latitude}`;

  const [weatherResponse, soilResponse, classificationResponse] = await Promise.all([
    fetch(weatherUrl),
    fetch(soilUrl),
    fetch(classificationUrl),
  ]);

  if (!weatherResponse.ok) throw new Error(`Weather service failed (${weatherResponse.status})`);
  if (!soilResponse.ok) throw new Error(`SoilGrids service failed (${soilResponse.status})`);

  const weather = await weatherResponse.json() as any;
  const soil = await soilResponse.json() as any;
  const classification = classificationResponse.ok ? await classificationResponse.json() as any : null;

  const average = (values: unknown) => {
    const arr = Array.isArray(values) ? values.filter((v): v is number => typeof v === "number" && Number.isFinite(v)) : [];
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  };

  const temperature = average(weather.hourly?.temperature_2m) ?? 25;
  const humidity = average(weather.hourly?.relative_humidity_2m) ?? 70;
  const rainfall = average(weather.hourly?.rain) != null
    ? Math.max(0, (average(weather.hourly?.rain) as number) * 24 * 30)
    : 100;

  // SoilGrids returns concentrations/texture values. N is converted to an approximate
  // kg/ha using a 20 cm layer and bulk density; P/K remain transparent profile estimates
  // because SoilGrids does not publish those nutrients in this endpoint.
  const nitrogenMgKg = extractProperty(soil, "nitrogen");
  const bdod = extractProperty(soil, "bdod");
  const nitrogen = nitrogenMgKg != null
    ? Math.round(Math.max(0, Math.min(140, nitrogenMgKg * (bdod ? bdod / 100 : 1.3) * 0.2 * 10)) / 1)
    : 50;

  const sand = extractProperty(soil, "sand");
  const clay = extractProperty(soil, "clay");
  const silt = extractProperty(soil, "silt");
  const phRaw = extractProperty(soil, "phh2o");
  const ph = phRaw != null ? Math.max(3.5, Math.min(10, phRaw / 10)) : 6.6;
  const soilType = classification?.classification?.most_probable_class?.name ||
    classification?.properties?.most_probable_class?.name ||
    classifyTexture(sand, clay);

  const phosphorus = Math.round(Math.max(5, Math.min(145, 45 + (clay ?? 30) * 0.7)));
  const potassium = Math.round(
  Math.max(5, Math.min(205, 70 + (clay ?? 30) * 1.5 + (silt ?? 30) * 0.2))
);
  return res.json({
    siteData: {
      ...coordinates,
      soilType,
      temperature: Number(temperature.toFixed(1)),
      humidity: Number(humidity.toFixed(0)),
      rainfall: Number(Math.min(300, rainfall).toFixed(0)),
      nitrogen,
      phosphorus,
      potassium,
      ph: Number(ph.toFixed(2)),
      source: "OpenStreetMap/Nominatim + Open-Meteo + ISRIC SoilGrids",
      notes: [
        "Weather values use the last 30 days of Open-Meteo hourly data.",
        "N is estimated from SoilGrids nitrogen and bulk density; P and K are profile estimates because SoilGrids does not provide P/K in this query.",
      ],
    }
  });
}
