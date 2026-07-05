import { Router } from "express";

import { asyncHandler } from "../../common/async-handler.js";
import { validate } from "../../common/validate.js";
import { idParamsSchema, submitRepairTicketSchema, updateRepairStatusSchema } from "./repair.schemas.js";
import { RepairService } from "./repair.service.js";

export const repairRouter = Router();
const repairService = new RepairService();

repairRouter.post(
  "/tickets",
  validate(submitRepairTicketSchema),
  asyncHandler(async (req, res) => {
    const ticket = await repairService.submitTicket(req.body);
    res.status(201).json(ticket);
  })
);

repairRouter.get(
  "/tickets/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const ticket = await repairService.getTicket(id);
    res.json(ticket);
  })
);

repairRouter.patch(
  "/tickets/:id/status",
  validate(idParamsSchema, "params"),
  validate(updateRepairStatusSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const ticket = await repairService.updateStatus(id, req.body.status);
    res.json(ticket);
  })
);
