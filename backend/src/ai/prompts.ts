import type { PredictionInput } from "./types.js";

export function cropSelectionPrompt(input: PredictionInput) {
  return `You are CropWise's agronomy crop-selection engine. Select the best crop using only the supplied farm conditions. Treat the values as indicative, not a laboratory diagnosis. Do not invent measurements.

Farm data:
Location: ${input.location}
Desired crops: ${input.desiredCrops || "none"}
Temperature: ${input.temperature} C
Humidity: ${input.humidity} %
Monthly rainfall: ${input.rainfall} mm
Nitrogen: ${input.nitrogen} kg/ha
Phosphorus: ${input.phosphorus} kg/ha
Potassium: ${input.potassium} kg/ha
pH: ${input.ph}
Soil type: ${input.soilType || "not specified"}
Historical yield: ${input.historicalYieldData || "not supplied"}
Other factors: ${input.otherRelevantParameters || "none"}

Return ONLY valid JSON with this exact shape:
{"recommendedCrop":"string","confidenceScore":0,"alternatives":[{"crop":"string","score":0,"rationale":"string"}],"selectionRationale":"string"}
Confidence is an integer from 0 to 100. Give 3 alternatives. Prefer common crops with plausible agronomic fit.`;
}

export function cultivationAdvicePrompt(input: PredictionInput, crop: string, rationale: string) {
  return `You are CropWise's cultivation advisor. Give practical, conservative advice for the selected crop. Avoid chemical dosage prescriptions and do not claim certainty. Mention when a local agronomist or soil test is appropriate.

Selected crop: ${crop}
Selection rationale: ${rationale}
Farm conditions: temperature ${input.temperature} C, humidity ${input.humidity}%, rainfall ${input.rainfall} mm/month, N ${input.nitrogen} kg/ha, P ${input.phosphorus} kg/ha, K ${input.potassium} kg/ha, pH ${input.ph}.
Soil type: ${input.soilType || "not specified"}. Location: ${input.location}.

Return ONLY valid JSON:
{"summary":"string","soil":["string"],"irrigation":["string"],"cultivation":["string"],"risks":["string"],"nextSteps":["string"]}
Use 2-4 concise bullets in each array.`;
}
