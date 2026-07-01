import type { Request, Response } from "express";
import { env } from "../config/env.js";

const COOKIE_PATH = "/api/auth";
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  // Browsers require Secure when SameSite=None (cross-origin SPA + API on Render).
  const secure = env.COOKIE_SECURE || env.COOKIE_SAME_SITE === "none";
  return {
    httpOnly: true as const,
    secure,
    sameSite: env.COOKIE_SAME_SITE,
    path: COOKIE_PATH,
  };
}

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(env.COOKIE_NAME, refreshToken, {
    ...cookieOptions(),
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, cookieOptions());
}

export function readRefreshCookie(req: Request): string | null {
  const value = req.cookies?.[env.COOKIE_NAME];
  return typeof value === "string" && value.length > 0 ? value : null;
}
