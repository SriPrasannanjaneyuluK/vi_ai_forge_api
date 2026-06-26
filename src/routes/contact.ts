import { Router } from "express";
import { z } from "zod";
import { submitContact } from "../services/content.js";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  message: z.string().trim().min(1).max(2000),
});

export const contactRouter = Router();

contactRouter.post("/", async (req, res, next) => {
  try {
    const input = contactSchema.parse(req.body);
    await submitContact(input);
    res.status(201).json({ ok: true, message: "Message received." });
  } catch (error) {
    next(error);
  }
});
