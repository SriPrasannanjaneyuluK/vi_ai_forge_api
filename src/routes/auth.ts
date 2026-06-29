import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { portalForgotPassword, portalLogin, portalSignup } from "../services/portalAuth.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  portal: z.enum(["public", "admin"]),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const result = await portalLogin(
    parsed.data.email,
    parsed.data.password,
    parsed.data.portal
  );

  if (!result.ok) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  res.json({ session: result.session, user: result.user });
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  portal: z.enum(["public", "admin"]),
  redirectTo: z.string().url(),
});

authRouter.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(404).json({ error: "No account found for this email." });
    return;
  }

  const result = await portalForgotPassword(
    parsed.data.email,
    parsed.data.portal,
    parsed.data.redirectTo
  );

  if (!result.ok) {
    res.status(404).json({ error: "No account found for this email." });
    return;
  }

  res.json({ ok: true });
});

const signupSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  fullName: z.string().min(1),
  portalRole: z.enum(["student", "teacher"]),
});

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your details and try again." });
    return;
  }

  const result = await portalSignup(parsed.data);

  if (!result.ok) {
    const status = result.error.includes("already exists") ? 409 : 400;
    res.status(status).json({ error: result.error });
    return;
  }

  res.status(201).json({ session: result.session, user: result.user });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
