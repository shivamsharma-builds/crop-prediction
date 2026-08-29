import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CONFIG_ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, "CONFIG_ENCRYPTION_KEY must be 64 hex characters"),
  OPENROUTER_API_KEY: z.string().optional().default(""),
  OPENROUTER_MODEL: z.string().default("openrouter/free"),
  OPENROUTER_SITE_URL: z.string().url().default("http://localhost:5173"),
  OPENROUTER_APP_NAME: z.string().default("CropWise"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD: z.string().min(8).default("change-me-now"),
  ADMIN_NAME: z.string().default("CropWise Admin"),
  COOKIE_SECURE: z.string().default("false").transform((v) => v === "true")
});

export const env = envSchema.parse(process.env);
