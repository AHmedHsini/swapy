import { Router } from "express";

import { asyncHandler } from "../../common/async-handler.js";
import { validate } from "../../common/validate.js";
import { idParamsSchema, registerUserSchema, updateUserSchema } from "./users.schemas.js";
import { UsersService } from "./users.service.js";

export const usersRouter = Router();
const usersService = new UsersService();

usersRouter.post(
  "/",
  validate(registerUserSchema),
  asyncHandler(async (req, res) => {
    const user = await usersService.register(req.body);
    res.status(201).json(user);
  })
);

usersRouter.get(
  "/leaderboard",
  asyncHandler(async (_req, res) => {
    const leaderboard = await usersService.getLeaderboard();
    res.json(leaderboard);
  })
);

usersRouter.get(
  "/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const user = await usersService.getById(id);
    res.json(user);
  })
);

usersRouter.patch(
  "/:id",
  validate(idParamsSchema, "params"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const user = await usersService.update(id, req.body);
    res.json(user);
  })
);
