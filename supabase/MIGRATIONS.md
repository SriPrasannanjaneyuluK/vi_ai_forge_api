# Database migrations

Marketing copy is **not** stored in Supabase. Edit `vi_ai_forge/src/lib/constants.ts` for website text.

The database stores:

- **Courses** + homepage featured course (admin-managed)
- **User profiles** (roles, access revoked)
- **Waitlist** and **contact** form submissions

## Files

| Order | File | Purpose |
|-------|------|---------|
| 0 | `migrations/000_reset_app_schema.sql` | **Only if needed** — drop app tables before re-running 001/002 |
| 1 | `migrations/001_courses_and_inquiries.sql` | Courses, featured course, waitlist, contact |
| 2 | `migrations/002_user_profiles_and_auth.sql` | Roles, profiles, signup trigger, `ensure_user_profile` |
| — | `seed.sql` | Optional sample courses (run after migrations) |

## Fresh database (you dropped all tables)

1. Open [Supabase](https://supabase.com) → your project → **SQL Editor**.
2. If you see errors like **`relation "courses" already exists`**, run **`000_reset_app_schema.sql`** first (drops app tables only).
3. Run **`001_courses_and_inquiries.sql`** — paste full file → **Run**.
4. Run **`002_user_profiles_and_auth.sql`** — paste full file → **Run**.
5. *(Optional)* Run **`seed.sql`** for sample courses.
5. In **Authentication → Users**, create your admin user (email + password).
6. Promote to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

7. Start the API: `npm run dev` (from `vi_ai_forge_api`).

## Verify

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:

- `contact_submissions`
- `courses`
- `latest_course`
- `latest_course_stack`
- `profiles`
- `waitlist_submissions`

## "relation already exists" error

You already ran part of a migration. In SQL Editor, run in this order:

1. `000_reset_app_schema.sql`
2. `001_courses_and_inquiries.sql`
3. `002_user_profiles_and_auth.sql`
4. `seed.sql` (optional)

Then promote your admin again:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

## Notes

- Only **published** courses (`is_published = true`) appear on the public site.
- Use the **admin portal** (`vi_ai_forge_admin`) to add courses and manage user access.
- If signup fails with a profile error, confirm migration `002` ran and `SUPABASE_SERVICE_ROLE_KEY` in `.env` is the **service_role** secret (not the anon key).
