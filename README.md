# VJ AI Forge API

Backend API for the [VJ AI Forge](../vi_ai_forge) frontend. Stores landing page content in **Supabase** and exposes REST endpoints for the React app.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the SQL files in order in the Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/seed.sql`
3. Copy environment variables:

```bash
cp .env.example .env
```

4. Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from **Project Settings → API**.
5. Install and start:

```bash
npm install
npm run dev
```

API runs at `http://localhost:3001`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/content` | All public site content |
| POST | `/api/waitlist` | `{ "email": "..." }` |
| POST | `/api/contact` | `{ "name", "email", "message" }` |

## Frontend connection

In the frontend `.env`:

```
VITE_API_URL=http://localhost:3001
```

For local dev, the Vite proxy also forwards `/api` to this server when `VITE_API_URL` is unset.

## Admin setup

1. Run `supabase/migrations/002_roles_and_course_publish.sql` in the Supabase SQL Editor.
2. In Supabase → **Authentication → Users**, create an admin user (email + password).
3. Promote that user to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

4. Add to the frontend `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Admin API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/me` | Bearer token | Current user + role |
| GET | `/api/admin/courses` | Admin | List all courses |
| POST | `/api/admin/courses` | Admin | Create course |
| PUT | `/api/admin/courses/:id` | Admin | Update course |
| DELETE | `/api/admin/courses/:id` | Admin | Delete course |

Admin panel: `http://localhost:5173/admin/login`

Only **published** courses appear on the public site.

