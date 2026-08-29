import { useState } from "react";
import {
  LocateFixed, MapPin, Sprout, Thermometer, Droplets, CloudRain,
  FlaskConical, Leaf, Loader2, WandSparkles, MapPinned, CheckCircle2,
} from "lucide-react";
import type { PredictionInput, SiteData } from "../types";
import { LocationVisualizer } from "./LocationVisualizer";
import { SliderField } from "./SliderField";
import { api } from "../lib/api";

const defaults: PredictionInput = {
  location: "", desiredCrops: "", temperature: 25, humidity: 70, rainfall: 100,
  nitrogen: 50, phosphorus: 82, potassium: 50, ph: 6.6, soilType: "",
  historicalYieldData: "", otherRelevantParameters: "",
};

export function CropForm({
  onSubmit, loading,
}: { onSubmit: (input: PredictionInput) => Promise<void>; loading: boolean }) {
  const [form, setForm] = useState<PredictionInput>(defaults);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [determining, setDetermining] = useState(false);
  const [parametersReady, setParametersReady] = useState(false);
  const [siteError, setSiteError] = useState("");

  const set = <K extends keyof PredictionInput>(key: K, value: PredictionInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateLocation = (location: string, coords?: { latitude: number; longitude: number }) => {
    set("location", location);
    setCoordinates(coords ?? null);
    setParametersReady(false);
    setSiteError("");
  };

  const currentLocation = () => {
    if (!navigator.geolocation) {
      setSiteError("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    setSiteError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateLocation(
          `Coordinates: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
          { latitude: coords.latitude, longitude: coords.longitude },
        );
        setLocating(false);
      },
      (error) => {
        setSiteError(error.message || "Unable to read your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const determineSite = async () => {
    if (!form.location.trim()) return;
    setDetermining(true);
    setSiteError("");
    try {
      const body = coordinates
        ? { location: form.location, ...coordinates }
        : { location: form.location };
      const { siteData } = await api.siteData(body);
      const next: SiteData = siteData;
      setForm((prev) => ({
        ...prev,
        location: next.displayName || prev.location,
        temperature: next.temperature,
        humidity: next.humidity,
        rainfall: next.rainfall,
        nitrogen: next.nitrogen,
        phosphorus: next.phosphorus,
        potassium: next.potassium,
        ph: next.ph,
        soilType: next.soilType,
      }));
      setCoordinates({ latitude: next.latitude, longitude: next.longitude });
      setParametersReady(true);
    } catch (error) {
      setSiteError(error instanceof Error ? error.message : "Unable to determine site parameters.");
      setParametersReady(false);
    } finally {
      setDetermining(false);
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (parametersReady && !loading) void onSubmit(form); }}
      className="section-card shadow-soft"
    >
      <div className="p-4 pb-3 sm:p-5">
        <h2 className="text-[17px] font-semibold text-gray-900">Farm &amp; Location Data</h2>
        <p className="mt-1 max-w-3xl text-[10px] leading-4 text-gray-500 sm:text-[11px]">
          Set the location first. Then determine the soil and site parameters from free geospatial, weather and soil datasets before crop prediction.
        </p>
      </div>

      <div className="space-y-3 px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="grid min-w-0 gap-3">
          <div className="section-card p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="label flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-green-600" /> Location
              </label>
              <button
                type="button" onClick={currentLocation} disabled={locating || determining}
                className="inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 sm:w-auto"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                {locating ? "Locating…" : "Use Current Location"}
              </button>
            </div>
            <input
              className="field mt-2" value={form.location}
              onChange={(e) => updateLocation(e.target.value)}
              placeholder="e.g. Deoghar, Jharkhand or a farm address"
              required
            />
            <p className="micro mt-1">Manual places are geocoded with OpenStreetMap Nominatim.</p>

            {form.location.trim() && (
              <button
                type="button" onClick={() => void determineSite()} disabled={determining || locating}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-wait disabled:opacity-70"
              >
                {determining ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPinned className="h-4 w-4" />}
                {determining ? "Determining soil & site parameters…" : "Determine Soil & All Parameters"}
              </button>
            )}

            
            {siteError && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-700">{siteError}</div>}

            <label className="label mt-4 flex items-center gap-1">
              <Sprout className="h-3.5 w-3.5 text-green-600" /> Desired Crops (Optional)
            </label>
            <input className="field mt-1" value={form.desiredCrops} onChange={(e) => set("desiredCrops", e.target.value)} placeholder="e.g. tomatoes, lettuce, strawberries" />
          </div>
          <LocationVisualizer location={form.location} coordinates={coordinates} />
        </div>

        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          <div className="section-card p-3 sm:p-4">
            <div className="mb-3"><h3 className="text-[13px] font-semibold">Environmental Parameters</h3><p className="micro">Values are filled from Open-Meteo after site determination.</p></div>
            <div className="space-y-4">
              <SliderField label="Avg. Temperature (°C)" icon={<Thermometer className="h-3.5 w-3.5 text-green-600" />} value={form.temperature} min={0} max={45} step={0.5} unit="°C" onChange={(v) => set("temperature", v)} left="0°C" right="45°C" />
              <SliderField label="Avg. Humidity (%)" icon={<Droplets className="h-3.5 w-3.5 text-green-600" />} value={form.humidity} min={0} max={100} unit="%" onChange={(v) => set("humidity", v)} left="0%" right="100%" />
              <SliderField label="Avg. Monthly Rainfall (mm)" icon={<CloudRain className="h-3.5 w-3.5 text-green-600" />} value={form.rainfall} min={0} max={300} unit="mm" onChange={(v) => set("rainfall", v)} left="0mm" right="300mm" />
            </div>
          </div>

          <div className="section-card p-3 sm:p-4">
            <div className="mb-3"><h3 className="text-[13px] font-semibold">Soil Parameters</h3><p className="micro">Soil type, pH and nutrient values are loaded after site determination.</p></div>
            <div className="space-y-4">
              <SliderField label="Nitrogen (N) content (kg/ha)" icon={<FlaskConical className="h-3.5 w-3.5 text-green-600" />} value={form.nitrogen} min={0} max={140} unit=" kg/ha" onChange={(v) => set("nitrogen", v)} left="0" right="140" />
              <SliderField label="Phosphorus (P) content (kg/ha)" icon={<Leaf className="h-3.5 w-3.5 text-green-600" />} value={form.phosphorus} min={5} max={145} unit=" kg/ha" onChange={(v) => set("phosphorus", v)} left="5" right="145" />
              <SliderField label="Potassium (K) content (kg/ha)" icon={<Leaf className="h-3.5 w-3.5 text-green-600" />} value={form.potassium} min={5} max={205} unit=" kg/ha" onChange={(v) => set("potassium", v)} left="5" right="205" />
              <SliderField label="pH value" icon={<FlaskConical className="h-3.5 w-3.5 text-green-600" />} value={form.ph} min={3.5} max={10} step={0.01} onChange={(v) => set("ph", v)} left="3.50" right="10.00" />
            </div>
            <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[9px] leading-4 text-slate-500">
              N comes from SoilGrids with a bulk-density conversion. P/K are transparent profile estimates because the free SoilGrids endpoint does not publish P/K.
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(120px,160px)]">
          <div>
            <label className="label">Soil Type &amp; Appearance</label>
            <input className="field mt-1" value={form.soilType} onChange={(e) => set("soilType", e.target.value)} placeholder="Determined from SoilGrids texture/classification" />
          </div>
          

        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div><label className="label">Historical Yield Data (Optional)</label><textarea className="textarea-field mt-1" value={form.historicalYieldData} onChange={(e) => set("historicalYieldData", e.target.value)} placeholder="e.g., Corn: 5 tons/acre (2023)" /></div>
          <div><label className="label">Other Relevant Parameters (Optional)</label><textarea className="textarea-field mt-1" value={form.otherRelevantParameters} onChange={(e) => set("otherRelevantParameters", e.target.value)} placeholder="e.g., Water availability, pest issues, market conditions" /></div>
        </div>

        <button
          type="submit" disabled={loading || !parametersReady}
          title={!parametersReady ? "Determine soil and site parameters first" : undefined}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
          {loading ? "Analyzing…" : parametersReady ? "Predict Suitable Crops" : "Determine Soil Parameters First"}
        </button>
      </div>
    </form>
  );
}
