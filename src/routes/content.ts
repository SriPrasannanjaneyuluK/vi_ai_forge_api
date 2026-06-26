import { Router } from "express";
import { fetchSiteContent } from "../services/content.js";

export const contentRouter = Router();

contentRouter.get("/", async (_req, res, next) => {
  try {
    const content = await fetchSiteContent();
    res.json(content);
  } catch (error) {
    next(error);
  }
});
