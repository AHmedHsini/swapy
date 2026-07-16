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

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return toPublicUser(user);
  }

  async update(id: string, input: UpdateUserInput) {
    await this.getById(id);

    const user = await prisma.user.update({
      where: { id },
      data: input
    });

    return toPublicUser(user);
  }

  async getLeaderboard() {
    const users = await prisma.user.findMany({
      orderBy: [
        { totalPoints: "desc" },
        { reputationScore: "desc" }
      ],
      include: {
        trustScoreSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    return users.map((user) => {
      const latestSnapshot = user.trustScoreSnapshots[0];
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        reputationScore: Number(user.reputationScore),
        totalPoints: user.totalPoints,
        riskLevel: latestSnapshot ? latestSnapshot.riskLevel : "LOW",
        completedTransactions: latestSnapshot ? latestSnapshot.completedTransactions : 0
      };
    });
  }
}

