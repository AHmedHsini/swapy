import { Router } from "express";

import { asyncHandler } from "../../common/async-handler.js";
import { validate } from "../../common/validate.js";
import { loginSchema } from "./auth.schemas.js";
import { AuthService } from "./auth.service.js";

export const authRouter = Router();
const authService = new AuthService();

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const session = await authService.login(req.body);
    res.json(session);
  })
);

