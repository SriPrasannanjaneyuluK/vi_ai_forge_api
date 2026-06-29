import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { supabase } from "../lib/supabase.js";
import type { UserRole } from "../middleware/auth.js";
import { normalizeEmail, validateEmail, validateFullName, validatePassword } from "../lib/validation.js";

export type PortalKind = "public" | "admin";
export type PortalSignupRole = "student" | "teacher";

const PUBLIC_ROLES = new Set<UserRole>(["student", "teacher", "user"]);

function readFullName(metadata: Record<string, unknown> | undefined) {
  const value = metadata?.full_name;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildPortalUser(
  userId: string,
  profile: { role: UserRole; email: string; access_revoked: boolean },
  metadata: Record<string, unknown> | undefined
) {
  return {
    id: userId,
    email: profile.email,
    role: profile.role,
    fullName: readFullName(metadata),
    accessRevoked: profile.access_revoked,
  };
}

function isRoleAllowedForPortal(role: UserRole, portal: PortalKind): boolean {
  if (portal === "admin") return role === "admin";
  return PUBLIC_ROLES.has(role);
}

function createAuthClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getProfileByEmail(email: string) {
  const normalizedEmail = email.trim();

  const { data, error } = await supabase
    .from("profiles")
    .select("role, access_revoked")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("Profile lookup error:", error.message);
    return null;
  }

  return data as { role: UserRole; access_revoked: boolean } | null;
}

async function getProfile(userId: string, email: string) {
  const { data, error } = await supabase.rpc("ensure_user_profile", {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    console.error("Profile ensure error:", error.message);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return row as { role: UserRole; email: string; access_revoked: boolean };
}

export async function portalLogin(
  email: string,
  password: string,
  portal: PortalKind
) {
  const authClient = createAuthClient();

  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return { ok: false as const };
  }

  const profile = await getProfile(data.user.id, data.user.email ?? email);

  if (
    !profile ||
    profile.access_revoked ||
    !isRoleAllowedForPortal(profile.role, portal)
  ) {
    await authClient.auth.signOut();
    return { ok: false as const };
  }

  return {
    ok: true as const,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
    user: buildPortalUser(data.user.id, profile, data.user.user_metadata),
  };
}

export async function portalSignup(input: {
  email: string;
  password: string;
  fullName: string;
  portalRole: PortalSignupRole;
}) {
  const emailError = validateEmail(input.email);
  if (emailError) return { ok: false as const, error: emailError };

  const nameError = validateFullName(input.fullName);
  if (nameError) return { ok: false as const, error: nameError };

  const passwordError = validatePassword(input.password);
  if (passwordError) return { ok: false as const, error: passwordError };

  const normalizedEmail = normalizeEmail(input.email);
  const trimmedName = input.fullName.trim();

  const existing = await getProfileByEmail(normalizedEmail);
  if (existing) {
    return {
      ok: false as const,
      error: "An account with this email already exists. Sign in instead.",
    };
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: trimmedName,
      portal_role: input.portalRole,
    },
  });

  if (createError || !created.user) {
    const message = createError?.message.toLowerCase() ?? "";
    if (message.includes("already") || message.includes("registered")) {
      return {
        ok: false as const,
        error: "An account with this email already exists. Sign in instead.",
      };
    }
    console.error("Signup error:", createError?.message);
    return { ok: false as const, error: "Unable to create account. Try again later." };
  }

  const login = await portalLogin(normalizedEmail, input.password, "public");
  if (!login.ok) {
    return { ok: false as const, error: "Account created but sign-in failed. Try signing in." };
  }

  return login;
}

export async function portalForgotPassword(
  email: string,
  portal: PortalKind,
  redirectTo: string
) {
  const profile = await getProfileByEmail(email);

  if (
    !profile ||
    profile.access_revoked ||
    !isRoleAllowedForPortal(profile.role, portal)
  ) {
    return { ok: false as const };
  }

  const authClient = createAuthClient();
  const { error } = await authClient.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });

  if (error) {
    console.error("Password reset error:", error.message);
    return { ok: false as const };
  }

  return { ok: true as const };
}
