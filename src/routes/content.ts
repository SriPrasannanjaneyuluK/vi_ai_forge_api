import { Router } from "express";
import { fetchPublicCourses } from "../services/content.js";

export const contentRouter = Router();

/** Published courses and featured course only — site copy lives in vi_ai_forge/src/lib/constants.ts */
contentRouter.get("/", async (_req, res, next) => {
  try {
    const content = await fetchPublicCourses();
    res.json(content);
  } catch (error) {
    next(error);
  }
});
