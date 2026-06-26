import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

if (
  env.SUPABASE_SERVICE_ROLE_KEY.startsWith("sb_publishable_") ||
  env.SUPABASE_SERVICE_ROLE_KEY.includes("anon")
) {
  console.warn(
    "WARNING: SUPABASE_SERVICE_ROLE_KEY looks like a publishable/anon key. " +
      "Use the service_role secret from Supabase → Settings → API."
  );
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
