-- 001: Courses (admin-managed) + public inquiry forms
-- Site marketing copy lives in vi_ai_forge/src/lib/constants.ts (not in the database).

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  icon TEXT NOT NULL,
  tag TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE latest_course (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE latest_course_stack (
  id SERIAL PRIMARY KEY,
  tech_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE waitlist_submissions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_submissions_email_unique
  ON waitlist_submissions (lower(email));

CREATE TABLE contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE latest_course ENABLE ROW LEVEL SECURITY;
ALTER TABLE latest_course_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published courses"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public read latest_course"
  ON latest_course FOR SELECT
  USING (true);

CREATE POLICY "Public read latest_course_stack"
  ON latest_course_stack FOR SELECT
  USING (true);
