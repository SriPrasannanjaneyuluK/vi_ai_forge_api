# VJ AI Forge — Platform overview

This document explains how the three apps work together, who can use each one, and what each user type gets today.

## The three apps

| App | Folder | URL (dev) | Who uses it |
|-----|--------|-----------|-------------|
| **Public site** | `vi_ai_forge/` | `http://localhost:5173` | Everyone (guests + students + teachers) |
| **Admin portal** | `vi_ai_forge_admin/` | `http://localhost:5174` | Admins only |
| **API** | `vi_ai_forge_api/` | `http://localhost:3001` | Called by both frontends (not opened in browser) |

All three share one **Supabase** project:

- **Supabase Auth** — email/password accounts (`auth.users`)
- **PostgreSQL** — courses, profiles, waitlist, contact forms (`public` schema)

The API uses the **service_role** key so it can read/write profiles and admin data. Frontends use the **anon** key only for Supabase Auth (login/signup).

---

## What lives where

### In the database (admin-managed or user-generated)

| Data | Table(s) | Who writes it |
|------|----------|---------------|
| Course catalog | `courses` | Admin portal |
| Homepage “featured” course | `latest_course`, `latest_course_stack` | Admin portal |
| User accounts & roles | `auth.users` + `profiles` | Signup + SQL promotion |
| Waitlist emails | `waitlist_submissions` | Public site CTA form |
| Contact messages | `contact_submissions` | Public site contact form |

Only courses with **`is_published = true`** appear on the public website.

### In code (not in the database)

All marketing and static copy is in **`vi_ai_forge/src/lib/constants.ts`**:

- Academy name, taglines, nav labels
- Founder bio, team members, testimonials
- “How it works”, stats, footer links, social links

Edit that file to change website text. The admin portal does **not** manage this content.

---

## User roles

Roles are stored in the `profiles` table as a PostgreSQL enum:

```sql
user_role: 'admin' | 'user' | 'student' | 'teacher'
```

Every Supabase Auth user gets a matching row in `profiles` (created automatically on signup via the `handle_new_user` trigger).

### Role summary

| Role | How you get it | Public site (`vi_ai_forge`) | Admin portal (`vi_ai_forge_admin`) |
|------|----------------|----------------------------|-----------------------------------|
| **Guest** | No account | Full marketing site, course list, waitlist & contact forms | Cannot log in |
| **Student** | Sign up and choose “Student” | Login, `/dashboard` → Student dashboard | Blocked (“This account cannot access this portal”) |
| **Teacher** | Sign up and choose “Teacher” | Login, `/dashboard` → Teacher dashboard | Blocked |
| **User** | Default if signup metadata is missing or invalid | Same as student (treated as student in the portal) | Blocked |
| **Admin** | Manual SQL after account exists | Blocked from portal login (admin accounts are for admin app only) | Full access: courses CRUD + user access management |

> **Important:** `admin` is never assigned at signup. Promote an account in Supabase SQL:
>
> ```sql
> UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
> ```

---

## What each user type gets (today)

### Guest (not signed in)

**Can access:**

- Home page: hero, courses section, learnings, founder, testimonials, contact, CTA
- **Courses list** — loaded from API (`GET /api/content`) — only published courses
- **Featured course** on hero — from `latest_course` table
- **Waitlist** — `POST /api/waitlist`
- **Contact form** — `POST /api/contact`
- Links to **Sign in** and **Enroll now** (`/login`, `/signup`)

**Cannot access:**

- `/dashboard` (redirects to login)

---

### Student (`student` or `user` role)

**Signup flow:**

1. User fills signup form at `/signup` and picks **Student** or **Teacher**
2. Supabase creates `auth.users` with metadata: `{ full_name, portal_role: "student" }`
3. DB trigger `handle_new_user` inserts `profiles` with `role = 'student'`
4. If email confirmation is off, user is logged in immediately; otherwise they confirm email first

**Can access:**

- Everything a guest can access
- **Student dashboard** at `/dashboard`:
  - “My courses” placeholder (enrollment not built yet)
  - “Coming soon”: assignments, certificates, learning paths

**Cannot access:**

- Admin portal
- Teacher dashboard (unless role is changed to `teacher`)

---

### Teacher (`teacher` role)

Same signup flow as student, but `portal_role: "teacher"` → `profiles.role = 'teacher'`.

**Can access:**

- Everything a guest can access
- **Teacher dashboard** at `/dashboard`:
  - “My classes” placeholder
  - “Coming soon”: grading, announcements, analytics

**Cannot access:**

- Admin portal (unless promoted to admin in SQL)

---

### Admin (`admin` role)

**Login:** Admin portal only (`vi_ai_forge_admin`), not the public site portal.

**Can access:**

| Feature | API route | What it does |
|---------|-----------|--------------|
| Course list (all, including drafts) | `GET /api/admin/courses` | See every course |
| Create course | `POST /api/admin/courses` | Add new course (draft by default) |
| Update course | `PUT /api/admin/courses/:id` | Edit fields, publish/unpublish |
| Delete course | `DELETE /api/admin/courses/:id` | Remove course |
| List all users | `GET /api/admin/users` | See emails, roles, revoked status |
| Revoke / restore access | `PATCH /api/admin/users/:id` | Set `access_revoked`; revoke also signs user out globally |
| Own profile | `GET /api/auth/me` | Verify session and role |

**Cannot:**

- Revoke or change their own account (API blocks self-modification)
- Revoke other admins from the UI (revoke button disabled for `role = 'admin'`)

**Cannot use (by design):**

- Public site `/login` — admin credentials are rejected with the same generic **“Invalid email or password”** as a wrong password. No session is created and nothing reveals that an admin account exists.

---

## Access control — how it works

### 1. Signup assigns portal role

```text
Signup form (student | teacher)
        ↓
Supabase Auth (raw_user_meta_data.portal_role)
        ↓
handle_new_user trigger
        ↓
profiles.role = student | teacher | user (fallback)
```

The function `resolve_portal_role()` maps metadata to the enum. Unknown values become `user`.

### 2. Portal-specific login (no cross-portal sessions)

Sign-in never talks to Supabase directly from the browser. Both apps call **`POST /api/auth/login`** with `{ email, password, portal }`:

| `portal` value | Used by | Allowed roles |
|----------------|---------|---------------|
| `public` | `vi_ai_forge` | `student`, `teacher`, `user` |
| `admin` | `vi_ai_forge_admin` | `admin` only |

Server flow:

```text
API verifies password with Supabase (server-side only)
        ↓
Loads profile.role from database
        ↓
Wrong portal or revoked? → discard session immediately, return 401
        ↓
Correct portal? → return tokens to the app that requested login
```

Wrong portal, revoked account, or bad password all return the same message: **“Invalid email or password.”** No clue is given about admin accounts or account type.

Password reset on the public site uses **`POST /api/auth/forgot-password`** with `portal: "public"`. Admin emails (and unknown emails) receive **“No account found for this email.”** and no reset email is sent.

### 3. Session restore on page refresh

If a stored session belongs to the wrong portal (e.g. admin cookie opened on the public site), the app silently clears it and shows the login page — no error message.

### 4. API middleware

| Middleware | Checks |
|------------|--------|
| `requireAuth` | Valid JWT, profile exists, `access_revoked = false` |
| `requireAdmin` | `requireAuth` + `role === 'admin'` |

Public routes (`/api/content`, `/api/waitlist`, `/api/contact`) need **no** login.

### 5. Access revocation

When an admin revokes a user:

1. `profiles.access_revoked` is set to `true`
2. API returns `403` for that user on all protected routes
3. Supabase **global sign-out** clears their sessions
4. Next login attempt shows **“Invalid email or password”** (same as wrong portal — no extra detail)

Restore sets `access_revoked = false`; user can sign in again.

---

## End-to-end flows

### Visitor browses courses

```text
Browser (vi_ai_forge)
  → GET /api/content
  → API reads courses WHERE is_published = true
  → Hero + Courses section render cards
```

### Student enrolls (account creation)

```text
/signup → Supabase signUp → profile created → /dashboard (StudentDashboard)
```

*Note: “Enroll now” currently creates an **account**, not a course enrollment. Course enrollment is planned (dashboard placeholders).*

### Admin publishes a course

```text
Admin portal → PUT /api/admin/courses/:id { is_published: true }
  → Public site shows course on next page load
```

### Admin promotes themselves

```text
Create user in Supabase Auth (or sign up on public site)
  → SQL: UPDATE profiles SET role = 'admin' WHERE email = '...'
  → Log in at vi_ai_forge_admin
```

---

## API reference (quick)

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/health` | None | Health check |
| `POST /api/auth/login` | None | Portal login (`portal: public \| admin`) |
| `POST /api/auth/forgot-password` | None | Portal password reset (`portal: public \| admin`) |
| `GET /api/content` | None | Published courses + featured course |
| `POST /api/waitlist` | None | Save waitlist email |
| `POST /api/contact` | None | Save contact message |
| `GET /api/auth/me` | Bearer JWT | Current user profile |
| `GET/POST/PUT/DELETE /api/admin/courses` | Admin JWT | Course management |
| `GET /api/admin/users` | Admin JWT | List profiles |
| `PATCH /api/admin/users/:id` | Admin JWT | Revoke/restore or change role |

---

## What is built vs coming soon

| Feature | Status |
|---------|--------|
| Marketing website | ✅ Live |
| Published course catalog from DB | ✅ Live |
| Student / teacher signup & login | ✅ Live |
| Role-based dashboards (shell UI) | ✅ Live |
| Admin course CRUD & publish | ✅ Live |
| Admin revoke/restore user access | ✅ Live |
| Course enrollment | 🔜 Placeholder in student dashboard |
| Assignments, certificates, learning paths | 🔜 Placeholder |
| Teacher classes, grading, analytics | 🔜 Placeholder |
| CMS for marketing copy | ❌ By design — use `constants.ts` |

---

## Environment checklist

| App | Key variables |
|-----|---------------|
| `vi_ai_forge` | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `vi_ai_forge_admin` | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `vi_ai_forge_api` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN`, `PORT` |

Database setup: see [`supabase/MIGRATIONS.md`](./supabase/MIGRATIONS.md).

---

## Mental model

Think of the platform as **two doors into one building**:

- **Front door** (`vi_ai_forge`) — students and teachers; marketing + learning portal
- **Staff door** (`vi_ai_forge_admin`) — admins only; courses and user access
- **Reception desk** (`vi_ai_forge_api`) — checks ID (JWT + profile role) before allowing staff actions

Everyone shares the same Supabase login system, but each app only lets in the roles it expects.
