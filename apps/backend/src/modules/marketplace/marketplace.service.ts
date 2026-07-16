import { ListingStatus, Prisma } from "@prisma/client";

import { HttpError } from "../../common/http-error.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreateCategoryInput,
  CreateFeedbackInput,
  CreateListingInput,
  ListListingsQuery,
  UpdateListingInput
} from "./marketplace.schemas.js";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export class MarketplaceService {
  async createCategory(input: CreateCategoryInput) {
    const slug = slugify(input.name);

    try {
      return await prisma.category.create({
        data: {
          name: input.name,
          slug
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "A category with this name already exists");
      }
      throw error;
    }
  }

  async listCategories() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async createListing(input: CreateListingInput) {
    await this.requireUser(input.userId);
    await this.requireCategory(input.categoryId);

    return prisma.listing.create({
      data: {
        ...input,
        price: input.price === undefined ? undefined : new Prisma.Decimal(input.price)
      },
      include: { category: true, owner: true }
    });
  }

  async listListings(query: ListListingsQuery) {
    const where: Prisma.ListingWhereInput = {
      status: query.status ?? ListingStatus.PUBLISHED,
      categoryId: query.categoryId,
      listingType: query.listingType
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } }
      ];
    }

    return prisma.listing.findMany({
      where,
      include: { category: true, owner: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async getListing(id: string) {
    const listing = await prisma.listing.findFirst({
      where: { id, status: { not: ListingStatus.DELETED } },
      include: { category: true, owner: true, feedbacks: true }
    });
    if (!listing) {
      throw new HttpError(404, "Listing not found");
    }
    return listing;
  }

  async updateListing(id: string, input: UpdateListingInput) {
    await this.getListing(id);

    if (input.categoryId) {
      await this.requireCategory(input.categoryId);
    }

    return prisma.listing.update({
      where: { id },
      data: {
        ...input,
        price: input.price === undefined ? undefined : input.price === null ? null : new Prisma.Decimal(input.price)
      },
      include: { category: true, owner: true }
    });
  }

  async deleteListing(id: string) {
    await this.getListing(id);
    await prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.DELETED }
    });
  }

  async submitFeedback(listingId: string, input: CreateFeedbackInput) {
    await this.getListing(listingId);
    await this.requireUser(input.reviewerId);

    try {
      return await prisma.feedback.create({
        data: {
          listingId,
          reviewerId: input.reviewerId,
          rating: input.rating,
          comment: input.comment
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "This reviewer already submitted feedback for this listing");
      }
      throw error;
    }
  }

  private async requireUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }
  }

  private async requireCategory(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
  }
}

