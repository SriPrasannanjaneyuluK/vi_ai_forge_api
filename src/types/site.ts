export type CourseIcon =
  | "layers"
  | "brain"
  | "network"
  | "terminal"
  | "code"
  | "server";

export interface Academy {
  name: string;
  tagline: string;
  caption: string;
  email: string;
  logo: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface LatestCourse {
  title: string;
  description: string;
  stack: string[];
  level: string;
  duration: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: CourseIcon;
  tag: string;
}

export interface Founder {
  name: string;
  role: string;
  bio: string;
  experience: string[];
  companies: string[];
  quote: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface LearningStep {
  step: number;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface PageSection {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export interface SiteContent {
  academy: Academy;
  navLinks: NavLink[];
  latestCourse: LatestCourse;
  courses: Course[];
  founder: Founder;
  team: TeamMember[];
  learningSteps: LearningStep[];
  stats: Stat[];
  testimonials: Testimonial[];
  socialLinks: SocialLink[];
  sections: Record<string, PageSection>;
}
