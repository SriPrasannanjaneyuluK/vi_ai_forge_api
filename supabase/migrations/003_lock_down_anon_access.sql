    -- 003: Remove anon/public read policies now that all clients use the API (service_role)

    DROP POLICY IF EXISTS "Public read published courses" ON courses;
    DROP POLICY IF EXISTS "Public read latest_course" ON latest_course;
    DROP POLICY IF EXISTS "Public read latest_course_stack" ON latest_course_stack;

    -- waitlist_submissions and contact_submissions already have RLS with no anon policies.
    -- profiles policy "Users can read own profile" requires authenticated JWT; API uses service_role.
