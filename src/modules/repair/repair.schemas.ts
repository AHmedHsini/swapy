import { RepairTicketStatus } from "@prisma/client";
import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().min(1)
});

export const submitRepairTicketSchema = z.object({
  userId: z.string().min(1),
  deviceName: z.string().trim().min(2).max(160),
  problemDescription: z.string().trim().min(10)
});

export const updateRepairStatusSchema = z.object({
  status: z.nativeEnum(RepairTicketStatus)
});

export type SubmitRepairTicketInput = z.infer<typeof submitRepairTicketSchema>;

