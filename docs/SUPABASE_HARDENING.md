# Supabase security hardening (server-only access)

After frontends no longer embed the anon key, apply these steps in the Supabase dashboard and database.

## Already done in code

- Frontends (`vi_ai_forge`, `vi_ai_forge_admin`) no longer import `@supabase/supabase-js` or `VITE_SUPABASE_*` env vars.
- All auth and data flows go through `vi_ai_forge_api` using `SUPABASE_SERVICE_ROLE_KEY` (and server-only `SUPABASE_ANON_KEY` for password login/refresh).
- Migration `003_lock_down_anon_access.sql` drops public anon read policies on `courses`, `latest_course`, and `latest_course_stack`.

## Apply migration

Run `003_lock_down_anon_access.sql` in the Supabase SQL editor (or via CLI) on your project.

## Dashboard checklist

1. **API keys** — Optionally rotate the anon key after deploy (update `SUPABASE_ANON_KEY` in API `.env` only).
2. **Auth** — Confirm email/password settings; no client redirect URLs should point to direct Supabase JS usage.
3. **Storage** — Disable or restrict if unused.
4. **Realtime** — Disable if unused.
5. **Network restrictions** (Pro) — Allowlist only your API server egress IP if available.

## RLS audit summary

| Table | RLS | Anon access after 003 |
|-------|-----|------------------------|
| `courses` | ON | None (no policies) |
| `latest_course` | ON | None |
| `latest_course_stack` | ON | None |
| `waitlist_submissions` | ON | None (no insert/select policies) |
| `contact_submissions` | ON | None |
| `profiles` | ON | None for anon; authenticated users may read own row only |

The API uses `service_role`, which bypasses RLS for server-mediated operations.

## Production cookies

Set in API `.env`:

```
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
```

Use `COOKIE_SAME_SITE=none` with `COOKIE_SECURE=true` if the API and SPA are on different registrable domains.
