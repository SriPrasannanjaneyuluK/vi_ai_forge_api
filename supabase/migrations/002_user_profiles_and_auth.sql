-- 002: User profiles, roles, signup trigger, and API profile helper

CREATE TYPE user_role AS ENUM ('admin', 'user', 'student', 'teacher');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  access_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.resolve_portal_role(meta_role TEXT)
RETURNS user_role
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN meta_role = 'teacher' THEN 'teacher'::user_role
    WHEN meta_role = 'student' THEN 'student'::user_role
    ELSE 'user'::user_role
  END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role TEXT;
BEGIN
  meta_role := NEW.raw_user_meta_data->>'portal_role';

  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    public.resolve_portal_role(meta_role)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id UUID, p_email TEXT)
RETURNS TABLE (role user_role, email TEXT, access_revoked BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role TEXT;
BEGIN
  SELECT raw_user_meta_data->>'portal_role'
  INTO meta_role
  FROM auth.users
  WHERE id = p_user_id;

  INSERT INTO public.profiles (id, email, role)
  VALUES (p_user_id, p_email, public.resolve_portal_role(meta_role))
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  RETURN QUERY
  SELECT profiles.role, profiles.email, profiles.access_revoked
  FROM public.profiles
  WHERE profiles.id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_profile(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT) TO service_role;

-- Optional: backfill profiles for auth users created before this migration
INSERT INTO profiles (id, email, role)
SELECT
  u.id,
  u.email,
  public.resolve_portal_role(u.raw_user_meta_data->>'portal_role')
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id);

-- Promote your first admin after creating the account in Supabase Auth:
-- UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
