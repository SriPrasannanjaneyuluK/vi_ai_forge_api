import { supabase } from "../lib/supabase.js";
import type { UserRole } from "../middleware/auth.js";

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  accessRevoked: boolean;
  createdAt: string;
}

function mapUser(row: Record<string, unknown>): AdminUser {
  return {
    id: row.id as string,
    email: row.email as string,
    role: row.role as UserRole,
    accessRevoked: row.access_revoked as boolean,
    createdAt: row.created_at as string,
  };
}

export async function listUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, access_revoked, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapUser);
}

export async function updateUserAccess(
  userId: string,
  input: { accessRevoked?: boolean; role?: UserRole },
  actingAdminId: string
) {
  if (userId === actingAdminId) {
    throw new Error("You cannot modify your own account");
  }

  const payload: Record<string, unknown> = {};
  if (input.accessRevoked !== undefined) payload.access_revoked = input.accessRevoked;
  if (input.role !== undefined) payload.role = input.role;

  if (Object.keys(payload).length === 0) {
    throw new Error("No changes provided");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("id, email, role, access_revoked, created_at")
    .single();

  if (error) throw new Error(error.message);

  if (input.accessRevoked === true) {
    try {
      await supabase.auth.admin.signOut(userId, "global");
    } catch (err) {
      console.warn("Failed to sign out revoked user:", err);
    }
  }

  return mapUser(data);
}
