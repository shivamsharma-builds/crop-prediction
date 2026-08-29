import { z } from "zod";

export const predictionInputSchema = z.object({
  location: z.string().min(3).max(120),
  desiredCrops: z.string().max(200).optional().default(""),
  temperature: z.coerce.number().min(0).max(45),
  humidity: z.coerce.number().min(0).max(100),
  rainfall: z.coerce.number().min(0).max(300),
  nitrogen: z.coerce.number().min(0).max(140),
  phosphorus: z.coerce.number().min(5).max(145),
  potassium: z.coerce.number().min(5).max(205),
  ph: z.coerce.number().min(3.5).max(10),
  soilType: z.string().max(120).optional().default(""),
  historicalYieldData: z.string().max(500).optional().default(""),
  otherRelevantParameters: z.string().max(500).optional().default("")
});

export const registerSchema = z.object({ name: z.string().min(2).max(80), email: z.string().email(), password: z.string().min(8).max(100) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(100) });
