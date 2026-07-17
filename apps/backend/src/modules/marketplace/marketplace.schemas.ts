import { ItemCondition, ListingStatus, ListingType, TransactionType } from "@prisma/client";
import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().min(1)
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120)
});

export const createListingSchema = z.object({
  userId: z.string().min(1),
  categoryId: z.string().min(1),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5),
  condition: z.nativeEnum(ItemCondition),
  listingType: z.nativeEnum(ListingType),
  price: z.coerce.number().nonnegative().optional(),
  imageUrl: z.string().url().max(500).optional(),
  location: z.string().trim().min(2).max(160)
});

export const updateListingSchema = z.object({
  categoryId: z.string().min(1).optional(),
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(5).optional(),
  condition: z.nativeEnum(ItemCondition).optional(),
  listingType: z.nativeEnum(ListingType).optional(),
  price: z.coerce.number().nonnegative().nullable().optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  location: z.string().trim().min(2).max(160).optional()
});

export const listListingsQuerySchema = z.object({
  status: z.nativeEnum(ListingStatus).optional(),
  categoryId: z.string().min(1).optional(),
  listingType: z.nativeEnum(ListingType).optional(),
  search: z.string().trim().min(1).optional()
});

export const createFeedbackSchema = z.object({
  reviewerId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional()
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListListingsQuery = z.infer<typeof listListingsQuerySchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const createTransactionSchema = z.object({
  listingId: z.string().min(1),
  offeredListingId: z.string().min(1).optional(),
  transactionType: z.nativeEnum(TransactionType),
  agreedPrice: z.coerce.number().nonnegative().optional(),
  scheduledLocation: z.string().trim().min(2).max(160).optional(),
  requesterId: z.string().min(1)
});

export const actorIdBodySchema = z.object({
  actorId: z.string().min(1)
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type ActorIdBody = z.infer<typeof actorIdBodySchema>;

