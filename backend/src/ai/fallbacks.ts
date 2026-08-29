import type { CropCandidate, CultivationAdvice, PredictionInput } from "./types.js";

function scoreRange(value: number, ideal: [number, number]) {
  if (value >= ideal[0] && value <= ideal[1]) return 1;
  const distance = value < ideal[0] ? ideal[0] - value : value - ideal[1];
  return Math.max(0, 1 - distance / Math.max(ideal[1] - ideal[0], 1));
}

const crops: Record<string, { temp: [number, number]; humidity: [number, number]; rain: [number, number]; n: [number, number]; p: [number, number]; k: [number, number]; ph: [number, number] }> = {
  Rice: { temp: [20, 35], humidity: [60, 95], rain: [100, 300], n: [40, 120], p: [15, 80], k: [30, 100], ph: [5.0, 7.5] },
  Wheat: { temp: [10, 25], humidity: [40, 75], rain: [30, 150], n: [40, 120], p: [15, 70], k: [25, 100], ph: [5.5, 7.5] },
  Maize: { temp: [18, 32], humidity: [45, 80], rain: [50, 180], n: [50, 130], p: [20, 90], k: [30, 120], ph: [5.5, 7.8] },
  Soybean: { temp: [20, 30], humidity: [50, 80], rain: [60, 180], n: [20, 80], p: [20, 80], k: [30, 110], ph: [5.5, 7.5] },
  Cotton: { temp: [21, 35], humidity: [40, 75], rain: [50, 180], n: [40, 110], p: [15, 80], k: [30, 120], ph: [5.5, 8.0] },
  Tomato: { temp: [18, 30], humidity: [45, 75], rain: [30, 120], n: [50, 120], p: [25, 100], k: [50, 140], ph: [5.5, 7.5] },
  Chickpea: { temp: [15, 30], humidity: [30, 65], rain: [20, 100], n: [15, 70], p: [20, 80], k: [20, 90], ph: [5.5, 8.0] }
};

export function deterministicCropSelection(input: PredictionInput): { recommendedCrop: string; confidenceScore: number; alternatives: CropCandidate[]; selectionRationale: string } {
  const requested = input.desiredCrops.split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const scored = Object.entries(crops).map(([crop, ideal]) => {
    const score = [
      scoreRange(input.temperature, ideal.temp), scoreRange(input.humidity, ideal.humidity), scoreRange(input.rainfall, ideal.rain),
      scoreRange(input.nitrogen, ideal.n), scoreRange(input.phosphorus, ideal.p), scoreRange(input.potassium, ideal.k), scoreRange(input.ph, ideal.ph)
    ].reduce((a, b) => a + b, 0) / 7;
    const boosted = requested.includes(crop.toLowerCase()) ? Math.min(1, score + 0.06) : score;
    return { crop, raw: boosted, score: Math.round(boosted * 100), rationale: `${crop} aligns with the supplied temperature, moisture, nutrient and pH ranges.` };
  }).sort((a, b) => b.raw - a.raw);
  const [best, ...rest] = scored;
  const confidenceScore = Math.max(40, Math.min(95, best?.score ?? 50));
  return {
    recommendedCrop: best?.crop ?? "Maize",
    confidenceScore,
    alternatives: rest.slice(0, 3).map(({ crop, score, rationale }) => ({ crop, score, rationale })),
    selectionRationale: best ? `${best.crop} has the strongest overall match across the seven supplied environmental and soil factors. This is a suitability estimate, not a substitute for a local agronomic assessment.` : "No crop score was available."
  };
}

export function fallbackAdvice(input: PredictionInput, crop: string): CultivationAdvice {
  return {
    summary: `${crop} is a reasonable fit for the supplied conditions. Validate the recommendation with a local soil test and current weather before planting.`,
    soil: [`Keep pH in a crop-appropriate range and confirm with a calibrated soil test.`, `Use the N-P-K readings as directional inputs rather than exact fertilizer prescriptions.`, `Maintain organic matter with compost, residue retention, or other locally suitable practices.`],
    irrigation: [`Adjust irrigation to rainfall and crop growth stage rather than using a fixed schedule.`, `Avoid prolonged waterlogging and check field drainage after heavy rainfall.`],
    cultivation: [`Use locally adapted, disease-resistant seed where available.`, `Time planting around local temperature and rainfall patterns.`, `Scout regularly for weeds, pests, nutrient deficiency and disease symptoms.`],
    risks: [`Weather variability can materially change crop suitability.`, `Nutrient values may vary by sampling depth and soil heterogeneity.`],
    nextSteps: [`Confirm soil results with a current lab test.`, `Compare this recommendation with local extension guidance and recent market conditions.`]
  };
}
