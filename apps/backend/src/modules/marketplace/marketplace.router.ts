import { Router } from "express";

import { asyncHandler } from "../../common/async-handler.js";
import { validate } from "../../common/validate.js";
import {
  createCategorySchema,
  createFeedbackSchema,
  createListingSchema,
  idParamsSchema,
  listListingsQuerySchema,
  updateListingSchema,
  createTransactionSchema,
  updateTransactionStatusSchema,
  type ListListingsQuery
} from "./marketplace.schemas.js";
import { MarketplaceService } from "./marketplace.service.js";

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
  asyncHandler(async (req, res) => {
    const listing = await marketplaceService.createListing(req.body);
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
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const feedback = await marketplaceService.submitFeedback(id, req.body);
    res.status(201).json(feedback);
  })
);

marketplaceRouter.post(
  "/transactions",
  validate(createTransactionSchema),
  asyncHandler(async (req, res) => {
    const transaction = await marketplaceService.createTransaction(req.body);
    res.status(201).json(transaction);
  })
);

marketplaceRouter.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const { userId, role } = req.query as { userId?: string; role?: 'owner' | 'requester' };
    const transactions = await marketplaceService.listTransactions({ userId, role });
    res.json(transactions);
  })
);

marketplaceRouter.get(
  "/transactions/:id",
  validate(idParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const transaction = await marketplaceService.getTransaction(id);
    res.json(transaction);
  })
);

marketplaceRouter.patch(
  "/transactions/:id/status",
  validate(idParamsSchema, "params"),
  validate(updateTransactionStatusSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const transaction = await marketplaceService.updateTransactionStatus(id, req.body.status);
    res.json(transaction);
  })
);
