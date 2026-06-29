import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";

export type UserRole = "admin" | "teacher" | "student" | "user";

function readFullName(metadata: Record<string, unknown> | undefined) {
  const value = metadata?.full_name;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  accessRevoked: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  const profile = await getOrCreateProfile(data.user.id, data.user.email ?? "");

  if (!profile) {
    res.status(403).json({
      error:
        "User profile not found. Run migrations 002 and 004 in Supabase, and verify SUPABASE_SERVICE_ROLE_KEY in the API .env file.",
    });
    return;
  }

  if (profile.access_revoked) {
    res.status(403).json({ error: "Your account access has been revoked" });
    return;
  }

  req.user = {
    id: data.user.id,
    email: profile.email,
    role: profile.role,
    fullName: readFullName(data.user.user_metadata),
    accessRevoked: profile.access_revoked,
  };

  next();
}

async function getOrCreateProfile(userId: string, email: string) {
  const { data, error } = await supabase.rpc("ensure_user_profile", {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    console.error("Profile ensure error:", error.message);
    if (error.message.includes("row-level security")) {
      console.error(
        "Hint: use the service_role secret key in vi_ai_forge_api/.env (not the publishable/anon key)."
      );
    }
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return row as { role: UserRole; email: string; access_revoked: boolean };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
