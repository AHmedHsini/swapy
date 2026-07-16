import { Router } from "express";

import { asyncHandler } from "../../common/async-handler.js";
import { validate } from "../../common/validate.js";
import { dashboardQuerySchema } from "./sustainability.schemas.js";
import { SustainabilityService } from "./sustainability.service.js";

export const sustainabilityRouter = Router();
const sustainabilityService = new SustainabilityService();

sustainabilityRouter.get(
  "/dashboard",
  validate(dashboardQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { userId } = req.query as { userId?: string };
    const dashboard = await sustainabilityService.getDashboard(userId);
    res.json(dashboard);
  })
);
