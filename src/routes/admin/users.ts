import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../../middleware/auth.js";
import { listUsers, updateUserAccess } from "../../services/users.js";

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAuth, requireAdmin);

adminUsersRouter.get("/", async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

const updateSchema = z.object({
  accessRevoked: z.boolean().optional(),
  role: z.enum(["admin", "teacher", "student", "user"]).optional(),
});

adminUsersRouter.patch("/:id", async (req, res, next) => {
  try {
    const input = updateSchema.parse(req.body);
    const user = await updateUserAccess(
      req.params.id,
      input,
      req.user!.id
    );
    res.json({ user });
  } catch (error) {
    next(error);
  }
});
