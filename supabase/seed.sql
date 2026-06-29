-- Optional sample courses (admin can add more via vi_ai_forge_admin)
-- Courses are created as drafts — publish them in the admin portal to show on the public site.

INSERT INTO courses (
  slug, title, description, level, duration, icon, tag, sort_order, is_published
) VALUES
  (
    'fullstack',
    'Full-Stack Production Patterns',
    'Learn how production applications are structured, tested, and deployed in professional environments.',
    'Intermediate',
    '10 weeks',
    'layers',
    'Industry aligned',
    1,
    true
  ),
  (
    'ai-ml',
    'AI/ML in Production',
    'From model training to serving APIs — build AI capabilities aligned with enterprise requirements.',
    'Advanced',
    '8 weeks',
    'brain',
    'Industry aligned',
    2,
    false
  ),
  (
    'system-design',
    'System Design',
    'Architect scalable systems through structured modules and real-world case studies.',
    'Advanced',
    '6 weeks',
    'network',
    'Industry aligned',
    3,
    false
  );

INSERT INTO latest_course (id, title, description, level, duration) VALUES
  (
    1,
    'Full-Stack Production Patterns',
    'Learn how production applications are structured, tested, and deployed in professional environments.',
    'Intermediate',
    '10 weeks'
  );

INSERT INTO latest_course_stack (tech_name, sort_order) VALUES
  ('React', 1),
  ('Node.js', 2),
  ('PostgreSQL', 3),
  ('Docker', 4);
