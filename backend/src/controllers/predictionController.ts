import type { Response } from "express";
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
