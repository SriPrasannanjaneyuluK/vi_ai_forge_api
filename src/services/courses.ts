import { supabase } from "../lib/supabase.js";
import type { CreateCourseInput } from "../types/course.js";

function mapCourse(row: Record<string, unknown>) {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    level: row.level as string,
    duration: row.duration as string,
    icon: row.icon as string,
    tag: row.tag as string,
    sortOrder: row.sort_order as number,
    isPublished: row.is_published as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listAdminCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCourse);
}

export async function createCourse(input: CreateCourseInput) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      level: input.level,
      duration: input.duration,
      icon: input.icon,
      tag: input.tag,
      sort_order: input.sortOrder,
      is_published: input.isPublished,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A course with this slug already exists");
    }
    throw new Error(error.message);
  }

  if (input.featureOnHomepage && input.isPublished) {
    await setFeaturedCourse({
      title: input.title,
      description: input.description,
      level: input.level,
      duration: input.duration,
      stack: input.stack ?? [],
    });
  }

  return mapCourse(data);
}

export async function updateCourse(id: number, input: Partial<CreateCourseInput>) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.level !== undefined) payload.level = input.level;
  if (input.duration !== undefined) payload.duration = input.duration;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.tag !== undefined) payload.tag = input.tag;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.isPublished !== undefined) payload.is_published = input.isPublished;

  const { data, error } = await supabase
    .from("courses")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  if (input.featureOnHomepage && input.isPublished) {
    await setFeaturedCourse({
      title: data.title,
      description: data.description,
      level: data.level,
      duration: data.duration,
      stack: input.stack ?? [],
    });
  }

  return mapCourse(data);
}

export async function deleteCourse(id: number) {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function setFeaturedCourse(input: {
  title: string;
  description: string;
  level: string;
  duration: string;
  stack: string[];
}) {
  const { error: courseError } = await supabase.from("latest_course").upsert({
    id: 1,
    title: input.title,
    description: input.description,
    level: input.level,
    duration: input.duration,
    updated_at: new Date().toISOString(),
  });

  if (courseError) throw new Error(courseError.message);

  await supabase.from("latest_course_stack").delete().neq("id", 0);

  if (input.stack.length > 0) {
    const { error: stackError } = await supabase.from("latest_course_stack").insert(
      input.stack.map((tech_name, index) => ({
        tech_name,
        sort_order: index + 1,
      }))
    );

    if (stackError) throw new Error(stackError.message);
  }
}
