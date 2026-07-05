import type { User } from "@prisma/client";

export function toPublicUser(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    imageUrl: user.imageUrl,
    campus: user.campus,
    reputationScore: user.reputationScore,
    totalPoints: user.totalPoints,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

