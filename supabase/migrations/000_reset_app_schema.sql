-- Run this ONLY when you need a clean reinstall (drops all app tables).
-- Safe to run if migrations failed halfway or you see "relation already exists".
-- Does NOT delete auth.users — only public app tables.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.ensure_user_profile(UUID, TEXT);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.resolve_portal_role(TEXT);

DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS waitlist_submissions CASCADE;
DROP TABLE IF EXISTS latest_course_stack CASCADE;
DROP TABLE IF EXISTS latest_course CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
