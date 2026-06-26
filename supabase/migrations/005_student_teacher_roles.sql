-- Extend user_role for student / teacher portal accounts.
-- Existing 'user' role is treated as student in the portal app.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'student';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'teacher';
