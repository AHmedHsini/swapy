import { Router } from "express";

import { asyncHandler } from "../../common/async-handler.js";
import { validate } from "../../common/validate.js";
import {
  createCategorySchema,
  createFeedbackSchema,
  createTransactionSchema,
  actorIdBodySchema,
  createListingSchema,
  idParamsSchema,
  type CreateTransactionInput,
  type ActorIdBody,
  listListingsQuerySchema,
  updateListingSchema,
  type ListListingsQuery
} from "./marketplace.schemas.js";
import { MarketplaceService } from "./marketplace.service.js";
import { requireAuth, type AuthRequest } from "../../common/auth.js";

export const marketplaceRouter = Router();
const marketplaceService = new MarketplaceService();

marketplaceRouter.post(
  "/categories",
  validate(createCategorySchema),
  asyncHandler(async (req, res) => {
    const category = await marketplaceService.createCategory(req.body);
    res.status(201).json(category);
  })
);

marketplaceRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await marketplaceService.listCategories();
    res.json(categories);
  })
);

marketplaceRouter.post(
  "/listings",
  validate(createListingSchema),
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    // Use authenticated user as listing owner
    const body = { ...req.body, userId: req.auth!.userId };
    const listing = await marketplaceService.createListing(body as any);
    res.status(201).json(listing);
  })
);

marketplaceRouter.get(
  "/listings",
  validate(listListingsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as ListListingsQuery;
    const listings = await marketplaceService.listListings(query);
    res.json(listings);
  })
);

marketplaceRouter.get(
  "/listings/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const listing = await marketplaceService.getListing(id);
    res.json(listing);
  })
);

marketplaceRouter.patch(
  "/listings/:id",
  validate(idParamsSchema, "params"),
  validate(updateListingSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const listing = await marketplaceService.updateListing(id, req.body);
    res.json(listing);
  })
);

marketplaceRouter.delete(
  "/listings/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    await marketplaceService.deleteListing(id);
    res.status(204).send();
  })
);

marketplaceRouter.post(
  "/listings/:id/feedback",
  validate(idParamsSchema, "params"),
  validate(createFeedbackSchema),
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params as { id: string };
    const feedback = await marketplaceService.submitFeedback(id, { ...req.body, reviewerId: req.auth!.userId } as any);
    res.status(201).json(feedback);
  })
);

// Transactions
marketplaceRouter.post(
  "/transactions",
  validate(createTransactionSchema),
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const input = req.body as unknown as CreateTransactionInput;
    // override requesterId with authenticated user
    input.requesterId = req.auth!.userId;
    const tx = await marketplaceService.createTransaction(input);
    res.status(201).json(tx);
  })
);

marketplaceRouter.get(
  "/transactions/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const tx = await marketplaceService.getTransaction(id);
    res.json(tx);
  })
);

marketplaceRouter.patch(
  "/transactions/:id/accept",
  validate(idParamsSchema, "params"),
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params as { id: string };
    const actorId = req.auth!.userId;
    const tx = await marketplaceService.acceptTransaction(id, actorId);
    res.json(tx);
  })
);

marketplaceRouter.patch(
  "/transactions/:id/complete",
  validate(idParamsSchema, "params"),
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params as { id: string };
    const actorId = req.auth!.userId;
    const tx = await marketplaceService.completeTransaction(id, actorId);
    res.json(tx);
  })
);
