import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "cropwise-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/admin", adminRoutes);

// In production, Express serves the Vite build from the same origin.
// This keeps the frontend and API on one Render Web Service.
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const frontendDist = path.resolve(currentDir, "../../frontend/dist");

app.use(express.static(frontendDist, { index: false }));
app.get("/*", (_req, res, next) => {
  if (_req.path.startsWith("/api/")) return next();
  return res.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.use(notFound);
app.use(errorHandler);

await connectDatabase();
app.listen(env.PORT, "0.0.0.0", () => console.log(`CropWise listening on port ${env.PORT}`));
