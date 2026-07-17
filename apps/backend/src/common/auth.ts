import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "./http-error.js";

export interface AuthRequest extends Request {
  auth?: { userId: string; role?: string };
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header) throw new HttpError(401, "Authorization header missing");
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") throw new HttpError(401, "Invalid authorization header format");
  const token = parts[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret) as any;
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch (err) {
    throw new HttpError(401, "Invalid or expired token");
  }
}
