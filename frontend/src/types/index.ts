export type User = { id: string; name: string; email: string; role: "user" | "admin" };
export type SiteData = {\n  latitude: number; longitude: number; displayName: string; soilType: string;\n  temperature: number; humidity: number; rainfall: number; nitrogen: number; phosphorus: number; potassium: number; ph: number;\n  source: string; notes?: string[];\n};\nexport type PredictionInput = {
  location: string; desiredCrops: string; temperature: number; humidity: number; rainfall: number;
  nitrogen: number; phosphorus: number; potassium: number; ph: number; soilType: string;
  historicalYieldData: string; otherRelevantParameters: string;
};
export type PredictionResult = {
  id?: string; recommendedCrop: string; confidenceScore: number;
  alternatives: { crop: string; score: number; rationale: string }[];
  selectionRationale: string;
  advice: { summary: string; soil: string[]; irrigation: string[]; cultivation: string[]; risks: string[]; nextSteps: string[] };
  usedFallback?: boolean; createdAt?: string;
};
