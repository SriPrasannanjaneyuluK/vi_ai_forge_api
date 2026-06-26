-- Seed data matching the VJ AI Forge frontend content

INSERT INTO site_settings (id, name, tagline, caption, email, logo) VALUES
  (1, 'VJ AI Forge', 'Code With Confidence', 'Professional technology education', 'hello@vjaiforge.com', '/logo.png');

INSERT INTO nav_links (label, href, sort_order) VALUES
  ('Courses', '#courses', 1),
  ('Learnings', '#learnings', 2),
  ('Contact', '#contact', 3);

INSERT INTO latest_course (id, title, description, level, duration) VALUES
  (1, 'Production-Ready Full Stack', 'Build and deploy apps the way teams do in industry — real repos, real reviews, real shipping.', 'Intermediate', '12 weeks');

INSERT INTO latest_course_stack (tech_name, sort_order) VALUES
  ('React', 1),
  ('Node.js', 2),
  ('PostgreSQL', 3),
  ('Docker', 4);

INSERT INTO courses (slug, title, description, level, duration, icon, tag, sort_order) VALUES
  ('fullstack', 'Full-Stack Production Patterns', 'Learn how production apps are structured, tested, and deployed — not just tutorials.', 'Intermediate', '10 weeks', 'layers', 'Industrial focus', 1),
  ('ai-ml', 'AI/ML in Production', 'From model training to serving APIs — build AI features teams actually ship.', 'Advanced', '8 weeks', 'brain', 'Industrial focus', 2),
  ('system-design', 'System Design Labs', 'Architect scalable systems through hands-on labs and real-world case studies.', 'Advanced', '6 weeks', 'network', 'Industrial focus', 3),
  ('devops', 'DevOps & Cloud Engineering', 'CI/CD, containers, and cloud — master the toolchain modern teams rely on.', 'Intermediate', '8 weeks', 'terminal', 'Industrial focus', 4),
  ('frontend', 'Modern Frontend Craft', 'Component architecture, performance, and accessibility at production quality.', 'Beginner', '8 weeks', 'code', 'Industrial focus', 5),
  ('backend', 'Backend Engineering Deep Dive', 'APIs, databases, caching, and security — code you''d be proud to merge.', 'Intermediate', '10 weeks', 'server', 'Industrial focus', 6);

INSERT INTO founder (id, name, role, bio, quote) VALUES
  (1, 'VJ', 'Founder & Lead Mentor', 'Passionate about bridging the gap between learning and industry. With years of experience building production systems, VJ founded VJ AI Forge to create a space where learners write code they''re proud to ship.', 'We don''t sell courses — we forge engineers who can walk into any team and contribute from day one.');

INSERT INTO founder_experience (text, sort_order) VALUES
  ('10+ years building production software at scale', 1),
  ('Led engineering teams across full-stack and AI products', 2),
  ('Mentored 200+ developers into their first industry roles', 3),
  ('Contributor to open-source and community-driven learning', 4);

INSERT INTO founder_companies (name, sort_order) VALUES
  ('TechCorp', 1),
  ('CloudScale', 2),
  ('DataFlow', 3),
  ('InnovateLabs', 4);

INSERT INTO team_members (name, role, bio, avatar, sort_order) VALUES
  ('Alex Chen', 'Full-Stack Mentor', 'Former senior engineer. Loves turning complex systems into clear lessons.', 'AC', 1),
  ('Sneha Patel', 'AI/ML Guide', 'ML engineer who believes the best way to learn is by shipping models.', 'SP', 2),
  ('Marcus Johnson', 'DevOps Coach', 'Infrastructure specialist. Makes CI/CD approachable through structured coursework.', 'MJ', 3),
  ('Divya Reddy', 'Community Lead', 'Builds spaces where learners support each other and grow together.', 'DR', 4);

INSERT INTO learning_steps (step, title, description, sort_order) VALUES
  (1, 'Select a Course', 'Choose a program aligned with your career goals and current skill level.', 1),
  (2, 'Complete Coursework', 'Progress through structured modules with production-grade code and tooling.', 2),
  (3, 'Assess Your Progress', 'Validate your understanding with assessments designed around industry standards.', 3),
  (4, 'Apply Your Skills', 'Build portfolio projects that demonstrate real-world engineering capability.', 4);

INSERT INTO stats (label, value, suffix, sort_order) VALUES
  ('Courses', 12, '+', 1),
  ('Hands-on Labs', 48, '+', 2),
  ('Active Learners', 500, '+', 3),
  ('Projects Shipped', 120, '+', 4);

INSERT INTO testimonials (quote, author, role, sort_order) VALUES
  ('This isn''t another course platform. The labs feel like my first week at a real company — in the best way.', 'Karthik R.', 'Software Engineer', 1),
  ('The structured coursework changed how I learn. I finally understand concepts I struggled with for months.', 'Meera L.', 'Full-Stack Developer', 2),
  ('Mock tests prepared me better than any bootcamp. I landed my first dev role within two months.', 'Arjun T.', 'Junior Developer', 3);

INSERT INTO social_links (label, href, sort_order) VALUES
  ('GitHub', 'https://github.com', 1),
  ('LinkedIn', 'https://linkedin.com', 2),
  ('Twitter', 'https://twitter.com', 3),
  ('Discord', 'https://discord.com', 4);

INSERT INTO page_sections (section_key, eyebrow, title, subtitle) VALUES
  ('hero', 'Professional Courses Platform', NULL, NULL),
  ('courses', 'Courses', 'Industry-aligned programs', 'Structured curricula focused on production patterns, professional tooling, and career-ready skills.'),
  ('founder', 'The Team', 'Forged by practitioners', 'Led by people who''ve built production systems and mentored engineers into industry.'),
  ('learnings', 'Learnings', 'A structured path to mastery', 'From course enrollment to applied projects — a clear, professional learning journey.'),
  ('testimonials', 'Testimonials', 'From our learners', 'Professionals and students who advanced their careers through our courses.'),
  ('cta', NULL, 'Start your learning journey', 'Join the waitlist and be the first to access courses and learnings at VJ AI Forge.'),
  ('contact', 'Contact', 'Let''s build together', 'Have questions about courses or enrollments? Reach out.');
