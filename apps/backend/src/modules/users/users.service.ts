import bcrypt from "bcryptjs";

import { HttpError } from "../../common/http-error.js";
import { prisma } from "../../config/prisma.js";
import { toPublicUser } from "./users.presenter.js";
import type { RegisterUserInput, UpdateUserInput } from "./users.schemas.js";

export class UsersService {
  async register(input: RegisterUserInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new HttpError(409, "A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        imageUrl: input.imageUrl,
        campus: input.campus,
        role: input.role
      }
    });

    return toPublicUser(user);
  }

  async getById(id: string, requesterId?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const snapshot = await prisma.trustScoreSnapshot.findFirst({ where: { userId: id }, orderBy: { createdAt: "desc" } });

    const publicUser = toPublicUser(user) as any;
    publicUser.trust = snapshot
      ? {
          score: Number(snapshot.score.toString()),
          riskLevel: snapshot.riskLevel,
          completedTransactions: snapshot.completedTransactions,
          averageRating: snapshot.averageRating ? Number(snapshot.averageRating.toString()) : null,
          reportedIssues: snapshot.reportedIssues,
          modelVersion: snapshot.modelVersion,
          createdAt: snapshot.createdAt
        }
      : null;

    // Optionally include whether the requester has an active transaction with this user
    if (requesterId) {
      const activeTx = await prisma.marketplaceTransaction.findFirst({
        where: {
          OR: [
            { requesterId: requesterId, ownerId: id },
            { requesterId: id, ownerId: requesterId }
          ],
          status: { not: "CANCELLED" }
        }
      });
      publicUser.hasActiveTransactionWithRequester = Boolean(activeTx);
    }

    return publicUser;
  }

  async update(id: string, input: UpdateUserInput) {
    await this.getById(id);

    const user = await prisma.user.update({
      where: { id },
      data: input
    });

    return toPublicUser(user);
  }
}

