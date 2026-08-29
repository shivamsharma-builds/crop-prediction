import type { Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { loginSchema, registerSchema } from "../utils/validation.js";
import { signToken } from "../utils/jwt.js";
import type { AuthRequest } from "../middleware/auth.js";
import { env } from "../config/env.js";

function setAuthCookie(res: Response, token: string) {
  res.cookie("cropwise_token", token, { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" });
}

export async function register(req: AuthRequest, res: Response) {
  const data = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email is already registered" });
  const user = await User.create(data);
  setAuthCookie(res, signToken(String(user._id)));
  return res.status(201).json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role } });
}

export async function login(req: AuthRequest, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() }).select("+password name email role");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const passwordValid = await bcrypt.compare(data.password, user.password);
  if (!passwordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  setAuthCookie(res, signToken(String(user._id)));
  return res.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role } });
}

export async function logout(_req: AuthRequest, res: Response) {
  res.clearCookie("cropwise_token", { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: "lax", path: "/" });
  return res.status(204).send();
}

export async function me(req: AuthRequest, res: Response) {
  return res.json({ user: req.user });
}
