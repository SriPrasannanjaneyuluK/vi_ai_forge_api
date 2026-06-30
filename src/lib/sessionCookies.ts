import type { Request, Response } from "express";
import { env } from "../config/env.js";

const COOKIE_PATH = "/api/auth";
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(env.COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: COOKIE_PATH,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: COOKIE_PATH,
  });
}

export function readRefreshCookie(req: Request): string | null {
  const value = req.cookies?.[env.COOKIE_NAME];
  return typeof value === "string" && value.length > 0 ? value : null;
}
