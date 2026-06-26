import "dotenv/config";
import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { contentRouter } from "./routes/content.js";
import { waitlistRouter } from "./routes/waitlist.js";
import { contactRouter } from "./routes/contact.js";
import { authRouter } from "./routes/auth.js";
import { adminCoursesRouter } from "./routes/admin/courses.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/content", contentRouter);
app.use("/api/waitlist", waitlistRouter);
app.use("/api/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin/courses", adminCoursesRouter);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid request", details: error.flatten() });
      return;
    }

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(env.PORT, () => {
  console.log(`VJ AI Forge API running on http://localhost:${env.PORT}`);
});
