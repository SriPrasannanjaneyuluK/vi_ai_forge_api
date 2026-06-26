import { supabase } from "../lib/supabase.js";
import type { SiteContent } from "../types/site.js";

export function emptySiteContent(): SiteContent {
  return {
    academy: { name: "", tagline: "", caption: "", email: "", logo: "" },
    navLinks: [],
    latestCourse: {
      title: "",
      description: "",
      level: "",
      duration: "",
      stack: [],
    },
    courses: [],
    founder: {
      name: "",
      role: "",
      bio: "",
      quote: "",
      experience: [],
      companies: [],
    },
    team: [],
    learningSteps: [],
    stats: [],
    testimonials: [],
    socialLinks: [],
    sections: {},
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const empty = emptySiteContent();

  const [
    settingsRes,
    navRes,
    latestCourseRes,
    stackRes,
    coursesRes,
    founderRes,
    experienceRes,
    companiesRes,
    teamRes,
    stepsRes,
    statsRes,
    testimonialsRes,
    socialRes,
    sectionsRes,
  ] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("nav_links").select("label, href").order("sort_order"),
    supabase.from("latest_course").select("*").eq("id", 1).maybeSingle(),
    supabase.from("latest_course_stack").select("tech_name").order("sort_order"),
    supabase.from("courses").select("*").eq("is_published", true).order("sort_order"),
    supabase.from("founder").select("*").eq("id", 1).maybeSingle(),
    supabase.from("founder_experience").select("text").order("sort_order"),
    supabase.from("founder_companies").select("name").order("sort_order"),
    supabase.from("team_members").select("name, role, bio, avatar").order("sort_order"),
    supabase.from("learning_steps").select("step, title, description").order("sort_order"),
    supabase.from("stats").select("label, value, suffix").order("sort_order"),
    supabase.from("testimonials").select("id, quote, author, role").order("sort_order"),
    supabase.from("social_links").select("label, href").order("sort_order"),
    supabase.from("page_sections").select("section_key, eyebrow, title, subtitle"),
  ]);

  const sections: SiteContent["sections"] = {};
  if (!sectionsRes.error && sectionsRes.data) {
    for (const row of sectionsRes.data) {
      sections[row.section_key] = {
        eyebrow: row.eyebrow ?? undefined,
        title: row.title ?? undefined,
        subtitle: row.subtitle ?? undefined,
      };
    }
  }

  const settings = settingsRes.data;
  const latestCourse = latestCourseRes.data;
  const founder = founderRes.data;

  return {
    academy: settings
      ? {
          name: settings.name,
          tagline: settings.tagline,
          caption: settings.caption,
          email: settings.email,
          logo: settings.logo,
        }
      : empty.academy,
    navLinks: navRes.error ? [] : (navRes.data ?? []),
    latestCourse: latestCourse
      ? {
          title: latestCourse.title,
          description: latestCourse.description,
          level: latestCourse.level,
          duration: latestCourse.duration,
          stack: stackRes.error
            ? []
            : (stackRes.data ?? []).map((row) => row.tech_name),
        }
      : empty.latestCourse,
    courses: coursesRes.error
      ? []
      : (coursesRes.data ?? []).map((course) => ({
          id: course.slug,
          title: course.title,
          description: course.description,
          level: course.level,
          duration: course.duration,
          icon: course.icon,
          tag: course.tag,
        })),
    founder: founder
      ? {
          name: founder.name,
          role: founder.role,
          bio: founder.bio,
          quote: founder.quote,
          experience: experienceRes.error
            ? []
            : (experienceRes.data ?? []).map((row) => row.text),
          companies: companiesRes.error
            ? []
            : (companiesRes.data ?? []).map((row) => row.name),
        }
      : empty.founder,
    team: teamRes.error ? [] : (teamRes.data ?? []),
    learningSteps: stepsRes.error ? [] : (stepsRes.data ?? []),
    stats: statsRes.error ? [] : (statsRes.data ?? []),
    testimonials: testimonialsRes.error ? [] : (testimonialsRes.data ?? []),
    socialLinks: socialRes.error ? [] : (socialRes.data ?? []),
    sections,
  };
}

export async function submitWaitlist(email: string) {
  const { error } = await supabase.from("waitlist_submissions").insert({ email });

  if (error?.code === "23505") {
    return { duplicate: true as const };
  }

  if (error) {
    throw new Error(error.message);
  }

  return { duplicate: false as const };
}

export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
}) {
  const { error } = await supabase.from("contact_submissions").insert(input);

  if (error) {
    throw new Error(error.message);
  }
}
