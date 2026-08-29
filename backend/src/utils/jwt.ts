import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(userId: string) {
  return jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}
