import type { z } from "zod";
import { predictionInputSchema } from "../utils/validation.js";

export type PredictionInput = z.infer<typeof predictionInputSchema>;

export type CropCandidate = { crop: string; score: number; rationale: string };
export type CultivationAdvice = {
  summary: string;
  soil: string[];
  irrigation: string[];
  cultivation: string[];
  risks: string[];
  nextSteps: string[];
};
