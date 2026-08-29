import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export type AuthRequest = Request & { user?: { id: string; role: "user" | "admin"; email: string; name: string } };

function getToken(req: Request) {
  const cookieToken = req.cookies?.cropwise_token;
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = getToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const user = await User.findById(payload.sub).select("name email role").lean();
    if (user) {
      req.user = { id: String(user._id), name: user.name, email: user.email, role: user.role as "user" | "admin" };
    }
  } catch {
    // Anonymous/expired sessions are allowed for public prediction.
  }
  next();
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const user = await User.findById(payload.sub).select("name email role").lean();
    if (!user) return res.status(401).json({ message: "User account not found" });
    req.user = { id: String(user._id), name: user.name, email: user.email, role: user.role as "user" | "admin" };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
}
