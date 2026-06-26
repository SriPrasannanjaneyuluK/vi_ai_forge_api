-- Secure profile creation for users missing a profiles row (bypasses RLS safely)

CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id UUID, p_email TEXT)
RETURNS TABLE (role user_role, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (p_user_id, p_email, 'user')
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
