import { supabase } from "../lib/supabase.js";
import type { PublicCoursesData } from "../types/site.js";

export async function fetchPublicCourses(): Promise<PublicCoursesData> {
  const [latestCourseRes, stackRes, coursesRes] = await Promise.all([
    supabase.from("latest_course").select("*").eq("id", 1).maybeSingle(),
    supabase.from("latest_course_stack").select("tech_name").order("sort_order"),
    supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("sort_order"),
  ]);

  const latestRow = latestCourseRes.data;
  const hasLatest =
    latestRow &&
    typeof latestRow.title === "string" &&
    latestRow.title.trim().length > 0;

  return {
    latestCourse: hasLatest
      ? {
          title: latestRow.title,
          description: latestRow.description,
          level: latestRow.level,
          duration: latestRow.duration,
          stack: stackRes.error
            ? []
            : (stackRes.data ?? []).map((row) => row.tech_name),
        }
      : null,
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
