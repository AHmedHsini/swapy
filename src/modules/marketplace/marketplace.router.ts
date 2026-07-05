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
