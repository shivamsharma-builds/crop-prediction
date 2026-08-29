import type { Response } from "express";
import { Prediction } from "../models/Prediction.js";
import { User } from "../models/User.js";
import { getOpenRouterSettings, getPublicSystemStatus, updateSystemConfig } from "../services/configService.js";
import { maskSecret } from "../utils/crypto.js";
import type { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

export async function getSystemConfig(_req: AuthRequest, res: Response) {
  const settings = await getOpenRouterSettings();
  return res.json({ isAiEnabled: settings.isAiEnabled, selectedModel: settings.selectedModel, apiKeyMasked: maskSecret(settings.apiKey) });
}

export async function patchSystemConfig(req: AuthRequest, res: Response) {
  const body = z.object({ apiKey: z.string().max(500).optional(), isAiEnabled: z.boolean().optional(), selectedModel: z.string().min(2).max(200).optional() }).parse(req.body);
  return res.json({ config: await updateSystemConfig(body) });
}

export async function listUsers(req: AuthRequest, res: Response) {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
  const users = await User.find(filter).select("name email role createdAt").sort({ createdAt: -1 }).lean();
  return res.json({ users });
}

export async function updateUser(req: AuthRequest, res: Response) {
  const body = z.object({ name: z.string().min(2).max(80).optional(), role: z.enum(["user", "admin"]).optional() }).parse(req.body);
  if (req.params.id === req.user!.id && body.role === "user") return res.status(400).json({ message: "You cannot remove your own admin role" });
  const user = await User.findByIdAndUpdate(req.params.id, body, { new: true }).select("name email role createdAt").lean();
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
}

export async function deleteUser(req: AuthRequest, res: Response) {
  if (req.params.id === req.user!.id) return res.status(400).json({ message: "You cannot delete your own account" });
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "User not found" });
  await Prediction.deleteMany({ userId: deleted._id });
  return res.status(204).send();
}

export async function listPredictions(req: AuthRequest, res: Response) {
  const crop = typeof req.query.crop === "string" ? req.query.crop.trim() : "";
  const filter = crop ? { recommendedCrop: new RegExp(crop, "i") } : {};
  const predictions = await Prediction.find(filter).populate("userId", "name email").sort({ createdAt: -1 }).limit(200).lean();
  return res.json({ predictions });
}

export async function deletePrediction(req: AuthRequest, res: Response) {
  const deleted = await Prediction.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Prediction not found" });
  return res.status(204).send();
}

export async function systemStatus(_req: AuthRequest, res: Response) {
  return res.json(await getPublicSystemStatus());
}
