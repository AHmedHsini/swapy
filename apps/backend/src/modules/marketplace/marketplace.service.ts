import { ListingStatus, Prisma, TransactionStatus, TransactionType, SustainabilityAction } from "@prisma/client";

import { HttpError } from "../../common/http-error.js";
import { prisma } from "../../config/prisma.js";
import type {
  CreateCategoryInput,
  CreateFeedbackInput,
  CreateListingInput,
  ListListingsQuery,
  UpdateListingInput,
  CreateTransactionInput,
  UpdateTransactionStatusInput
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

  async createTransaction(input: CreateTransactionInput) {
    const listing = await prisma.listing.findUnique({
      where: { id: input.listingId }
    });

    if (!listing) {
      throw new HttpError(404, "Listing not found");
    }

    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new HttpError(400, "Listing is not available for transactions");
    }

    if (listing.userId === input.requesterId) {
      throw new HttpError(400, "You cannot request a transaction for your own listing");
    }

    await this.requireUser(input.requesterId);

    if (input.offeredListingId) {
      const offered = await prisma.listing.findUnique({ where: { id: input.offeredListingId } });
      if (!offered) {
        throw new HttpError(404, "Offered listing not found");
      }
    }

    return prisma.marketplaceTransaction.create({
      data: {
        listingId: input.listingId,
        requesterId: input.requesterId,
        ownerId: listing.userId,
        transactionType: input.transactionType,
        agreedPrice: input.agreedPrice !== undefined ? new Prisma.Decimal(input.agreedPrice) : null,
        offeredListingId: input.offeredListingId || null,
        scheduledLocation: input.scheduledLocation || null,
        status: TransactionStatus.REQUESTED
      },
      include: {
        listing: { include: { category: true } },
        requester: true,
        owner: true
      }
    });
  }

  async getTransaction(id: string) {
    const transaction = await prisma.marketplaceTransaction.findUnique({
      where: { id },
      include: {
        listing: { include: { category: true } },
        requester: true,
        owner: true
      }
    });

    if (!transaction) {
      throw new HttpError(404, "Transaction not found");
    }

    return transaction;
  }

  async updateTransactionStatus(id: string, status: TransactionStatus) {
    const transaction = await this.getTransaction(id);

    if (transaction.status === TransactionStatus.COMPLETED || transaction.status === TransactionStatus.CANCELLED) {
      throw new HttpError(400, `Cannot update status of a ${transaction.status.toLowerCase()} transaction`);
    }

    if (status !== TransactionStatus.COMPLETED) {
      return prisma.marketplaceTransaction.update({
        where: { id },
        data: { status },
        include: {
          listing: { include: { category: true } },
          requester: true,
          owner: true
        }
      });
    }

    // Complete transaction flow
    const slug = transaction.listing.category.slug;
    let co2 = new Prisma.Decimal("5.00");
    let ewaste = new Prisma.Decimal("0.50");
    let water = new Prisma.Decimal("100.00");
    let money = transaction.agreedPrice || transaction.listing.price || new Prisma.Decimal("15.00");

    if (slug === "electronics" || slug === "tools-lab") {
      ewaste = new Prisma.Decimal("1.50");
      co2 = new Prisma.Decimal("12.00");
      water = new Prisma.Decimal("300.00");
    } else if (slug === "books") {
      ewaste = new Prisma.Decimal("0.00");
      co2 = new Prisma.Decimal("2.00");
      water = new Prisma.Decimal("50.00");
    }

    let action: SustainabilityAction = SustainabilityAction.ITEM_REUSED;
    if (transaction.transactionType === TransactionType.DONATION) {
      action = SustainabilityAction.ITEM_DONATED;
    } else if (transaction.transactionType === TransactionType.EXCHANGE) {
      action = SustainabilityAction.EXCHANGE_COMPLETED;
    } else if (transaction.transactionType === TransactionType.REPAIR) {
      action = SustainabilityAction.DEVICE_REPAIRED;
      ewaste = new Prisma.Decimal("2.00");
      co2 = new Prisma.Decimal("8.00");
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update transaction
      const updatedTx = await tx.marketplaceTransaction.update({
        where: { id },
        data: {
          status: TransactionStatus.COMPLETED,
          completedAt: new Date()
        },
        include: {
          listing: { include: { category: true } },
          requester: true,
          owner: true
        }
      });

      // 2. Update listing status
      await tx.listing.update({
        where: { id: transaction.listingId },
        data: { status: ListingStatus.COMPLETED }
      });

      // 3. Create impact events
      await tx.sustainabilityImpactEvent.create({
        data: {
          userId: transaction.requesterId,
          listingId: transaction.listingId,
          transactionId: transaction.id,
          action,
          co2KgAvoided: co2,
          ewasteKgReduced: ewaste,
          waterLitersSaved: water,
          moneySaved: money
        }
      });

      await tx.sustainabilityImpactEvent.create({
        data: {
          userId: transaction.ownerId,
          listingId: transaction.listingId,
          transactionId: transaction.id,
          action,
          co2KgAvoided: co2,
          ewasteKgReduced: ewaste,
          waterLitersSaved: water,
          moneySaved: money
        }
      });

      // 4. Update user points & reputation
      const pointsReward = 100;
      
      const newRequesterRep = DecimalMin(new Prisma.Decimal(transaction.requester.reputationScore).add("0.1"), new Prisma.Decimal("5.00"));
      await tx.user.update({
        where: { id: transaction.requesterId },
        data: {
          totalPoints: { increment: pointsReward },
          reputationScore: newRequesterRep
        }
      });

      const newOwnerRep = DecimalMin(new Prisma.Decimal(transaction.owner.reputationScore).add("0.1"), new Prisma.Decimal("5.00"));
      await tx.user.update({
        where: { id: transaction.ownerId },
        data: {
          totalPoints: { increment: pointsReward },
          reputationScore: newOwnerRep
        }
      });

      return updatedTx;
    });
  }
  async listTransactions(query: { userId?: string; role?: 'owner' | 'requester' }) {
    const where: Prisma.MarketplaceTransactionWhereInput = {};
    if (query.userId) {
      if (query.role === 'owner') {
        where.ownerId = query.userId;
      } else if (query.role === 'requester') {
        where.requesterId = query.userId;
      } else {
        where.OR = [
          { ownerId: query.userId },
          { requesterId: query.userId }
        ];
      }
    }

    return prisma.marketplaceTransaction.findMany({
      where,
      include: {
        listing: { include: { category: true } },
        requester: true,
        owner: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
}

function DecimalMin(a: Prisma.Decimal, b: Prisma.Decimal): Prisma.Decimal {
  return a.lessThan(b) ? a : b;
}

