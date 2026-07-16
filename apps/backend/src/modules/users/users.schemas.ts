import { Campus, UserRole } from "@prisma/client";
import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().min(1)
});

export const registerUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
  imageUrl: z.string().url().max(500).optional(),
  campus: z.nativeEnum(Campus).default(Campus.OTHER),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT)
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  campus: z.nativeEnum(Campus).optional()
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

