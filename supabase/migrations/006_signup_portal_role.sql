-- Assign student/teacher role from signup metadata when creating profiles

CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id UUID, p_email TEXT)
RETURNS TABLE (role user_role, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role TEXT;
  assigned_role user_role;
BEGIN
  SELECT raw_user_meta_data->>'portal_role'
  INTO meta_role
  FROM auth.users
  WHERE id = p_user_id;

  assigned_role := CASE
    WHEN meta_role = 'teacher' THEN 'teacher'::user_role
    WHEN meta_role = 'student' THEN 'student'::user_role
    ELSE 'user'::user_role
  END;

  INSERT INTO public.profiles (id, email, role)
  VALUES (p_user_id, p_email, assigned_role)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  RETURN QUERY
  SELECT profiles.role, profiles.email
  FROM public.profiles
  WHERE profiles.id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_profile(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT) TO service_role;
