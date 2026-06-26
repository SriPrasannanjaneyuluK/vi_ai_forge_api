import { z } from "zod";

const courseIconSchema = z.enum([
  "layers",
  "brain",
  "network",
  "terminal",
  "code",
  "server",
]);

export const createCourseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(600),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  duration: z.string().trim().min(2).max(40),
  icon: courseIconSchema,
  tag: z.string().trim().min(2).max(60),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isPublished: z.boolean().default(false),
  featureOnHomepage: z.boolean().default(false),
  stack: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export interface AdminCourse {
  id: number;
  slug: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: string;
  tag: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
