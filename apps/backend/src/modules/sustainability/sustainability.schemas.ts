import { z } from "zod";

export const dashboardQuerySchema = z.object({
  userId: z.string().min(1).optional()
});

