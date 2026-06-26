import { Router } from "express";
import { z } from "zod";
import { submitWaitlist } from "../services/content.js";

const waitlistSchema = z.object({
  email: z.string().email(),
});

export const waitlistRouter = Router();

waitlistRouter.post("/", async (req, res, next) => {
  try {
    const { email } = waitlistSchema.parse(req.body);
    const result = await submitWaitlist(email.trim().toLowerCase());

    if (result.duplicate) {
      res.status(200).json({ ok: true, message: "You are already on the waitlist." });
      return;
    }

    res.status(201).json({ ok: true, message: "Added to the waitlist." });
  } catch (error) {
    next(error);
  }
});
