-- Backfill profiles for users created before migration 002
INSERT INTO profiles (id, email, role)
SELECT
  u.id,
  u.email,
  'user'::user_role
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
  );

-- Promote your admin (replace email):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
