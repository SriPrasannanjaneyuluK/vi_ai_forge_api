# VJ AI Forge API

Backend for **vi_ai_forge** (public site + student/teacher portal) and **vi_ai_forge_admin** (admin portal).

## What lives in the database

| Data | Managed by |
|------|------------|
| Published **courses** + featured homepage course | Admin portal |
| **User profiles** (roles, access revoked) | Admin portal + auth |
| Waitlist & contact form submissions | Public site forms |

**Marketing copy** is in `vi_ai_forge/src/lib/constants.ts` — not in Supabase.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run migrations — see **[`supabase/MIGRATIONS.md`](supabase/MIGRATIONS.md)**.
3. Copy `.env.example` to `.env` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN`.
4. `npm install && npm run dev` — API at `http://localhost:3001`.

## Public endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/content` | Published courses + featured course |
| POST | `/api/waitlist` | `{ "email" }` |
| POST | `/api/contact` | `{ "name", "email", "message" }` |
| GET | `/api/auth/me` | Bearer token — current user profile |

## Admin endpoints (admin role)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/admin/courses` | Course CRUD |
| GET | `/api/admin/users` | List portal users |
| PATCH | `/api/admin/users/:id` | Revoke/restore access |

Admin portal: `http://localhost:5174`

Only **published** courses appear on the public site.
