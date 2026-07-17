import { ListingStatus, Prisma, TransactionStatus } from "@prisma/client";

import { HttpError } from "../../common/http-error.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreateCategoryInput,
  CreateFeedbackInput,
  CreateListingInput,
  CreateTransactionInput,
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
    // Ensure that the reviewer participated in a completed transaction for this listing
    const transaction = await prisma.marketplaceTransaction.findFirst({
      where: {
        listingId,
        status: TransactionStatus.COMPLETED,
        OR: [{ requesterId: input.reviewerId }, { ownerId: input.reviewerId }]
      }
    });

    if (!transaction) {
      throw new HttpError(403, "Feedback may only be submitted by participants of a completed transaction");
    }

    try {
      const feedback = await prisma.feedback.create({
        data: {
          listingId,
          reviewerId: input.reviewerId,
          rating: input.rating,
          comment: input.comment
        }
      });

      // Recalculate trust for the listing owner (the reviewed user)
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (listing) {
        await this.computeAndPersistTrustSnapshotForUser(listing.userId);
      }

      return feedback;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "This reviewer already submitted feedback for this listing");
      }
      throw error;
    }
  }

  async createTransaction(input: CreateTransactionInput) {
    await this.getListing(input.listingId);
    await this.requireUser(input.requesterId);

    const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
    if (!listing) throw new HttpError(404, "Listing not found");
    if (listing.userId === input.requesterId) {
      throw new HttpError(400, "Owner cannot request their own listing");
    }

    return prisma.marketplaceTransaction.create({
      data: {
        listingId: input.listingId,
        requesterId: input.requesterId,
        ownerId: listing.userId,
        offeredListingId: input.offeredListingId ?? undefined,
        transactionType: input.transactionType as any,
        agreedPrice: input.agreedPrice === undefined ? undefined : new Prisma.Decimal(input.agreedPrice),
        scheduledLocation: input.scheduledLocation
      }
    });
  }

  async getTransaction(id: string) {
    const tx = await prisma.marketplaceTransaction.findUnique({ where: { id } });
    if (!tx) throw new HttpError(404, "Transaction not found");
    return tx;
  }

  async acceptTransaction(id: string, actorId: string) {
    const tx = await this.getTransaction(id);
    if (tx.ownerId !== actorId) {
      throw new HttpError(403, "Only the listing owner may accept a transaction request");
    }
    if (tx.status !== TransactionStatus.REQUESTED) {
      throw new HttpError(409, "Transaction is not in a state that can be accepted");
    }
    return prisma.marketplaceTransaction.update({ where: { id }, data: { status: TransactionStatus.ACCEPTED } });
  }

  async completeTransaction(id: string, actorId: string) {
    const tx = await this.getTransaction(id);
    if (tx.requesterId !== actorId && tx.ownerId !== actorId) {
      throw new HttpError(403, "Only transaction participants may mark it complete");
    }
    if (tx.status === TransactionStatus.COMPLETED) {
      return tx;
    }
    if (tx.status === TransactionStatus.REJECTED || tx.status === TransactionStatus.CANCELLED) {
      throw new HttpError(409, "Transaction cannot be completed from its current state");
    }
    return prisma.marketplaceTransaction.update({ where: { id }, data: { status: TransactionStatus.COMPLETED, completedAt: new Date() } });
  }

  private async computeAndPersistTrustSnapshotForUser(userId: string) {
    // Aggregate average rating where user is owner of the listing
    const ratings = await prisma.feedback.findMany({
      where: { listing: { ownerId: userId } },
      select: { rating: true }
    });

    const avgRating = ratings.length === 0 ? null : ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;

    // Completed transactions where user participated
    const completedCount = await prisma.marketplaceTransaction.count({
      where: {
        status: TransactionStatus.COMPLETED,
        OR: [{ ownerId: userId }, { requesterId: userId }]
      }
    });

    const totalCount = await prisma.marketplaceTransaction.count({
      where: {
        OR: [{ ownerId: userId }, { requesterId: userId }]
      }
    });

    const successRatio = totalCount === 0 ? 0 : completedCount / totalCount;

    // Profile completeness heuristic
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const profileCompleteness = user ? ((user.imageUrl ? 20 : 0) + (user.firstName ? 20 : 0) + (user.lastName ? 20 : 0) + (user.email ? 20 : 0) + (user.reputationScore ? 20 : 0)) / 100 : 0;

    const avgNorm = avgRating === null ? 0.5 : (avgRating - 1) / 4; // 0..1
    const countNorm = 1 - Math.exp(-completedCount / 10);
    const verified = false; // placeholder - no verified flag in schema

    const score = Math.round(
      100 * (
        0.4 * avgNorm +
        0.2 * countNorm +
        0.12 * (avgRating ? Math.min(1, avgRating / 5) : 0) +
        0.1 * (verified ? 1 : 0) +
        0.08 * profileCompleteness +
        0.1 * successRatio
      )
    );

    const riskLevel = score >= 85 ? "LOW" : score >= 70 ? "MEDIUM" : "HIGH";

    await prisma.trustScoreSnapshot.create({
      data: {
        userId,
        score: new Prisma.Decimal(score),
        riskLevel: riskLevel as any,
        completedTransactions: completedCount,
        averageRating: avgRating === null ? undefined : new Prisma.Decimal(Number(avgRating.toFixed(2))),
        reportedIssues: 0,
        modelVersion: "local-v1"
      }
    });
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

