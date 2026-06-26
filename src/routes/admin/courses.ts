import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { createCourseSchema, updateCourseSchema } from "../../types/course.js";
import {
  createCourse,
  deleteCourse,
  listAdminCourses,
  updateCourse,
} from "../../services/courses.js";

export const adminCoursesRouter = Router();

adminCoursesRouter.use(requireAuth, requireAdmin);

adminCoursesRouter.get("/", async (_req, res, next) => {
  try {
    const courses = await listAdminCourses();
    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

adminCoursesRouter.post("/", async (req, res, next) => {
  try {
    const input = createCourseSchema.parse(req.body);
    const course = await createCourse(input);
    res.status(201).json({ course });
  } catch (error) {
    next(error);
  }
});

adminCoursesRouter.put("/:id", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const input = updateCourseSchema.parse(req.body);
    const course = await updateCourse(id, input);
    res.json({ course });
  } catch (error) {
    next(error);
  }
});

adminCoursesRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await deleteCourse(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
