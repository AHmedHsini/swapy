import { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

export class SustainabilityService {
  async getDashboard(userId?: string) {
    const where: Prisma.SustainabilityImpactEventWhereInput = userId ? { userId } : {};

    const aggregate = await prisma.sustainabilityImpactEvent.aggregate({
      where,
      _sum: {
        co2KgAvoided: true,
        ewasteKgReduced: true,
        waterLitersSaved: true,
        moneySaved: true
      },
      _count: true
    });

    return {
      impactEvents: aggregate._count,
      co2KgAvoided: aggregate._sum.co2KgAvoided ?? new Prisma.Decimal(0),
      ewasteKgReduced: aggregate._sum.ewasteKgReduced ?? new Prisma.Decimal(0),
      waterLitersSaved: aggregate._sum.waterLitersSaved ?? new Prisma.Decimal(0),
      moneySaved: aggregate._sum.moneySaved ?? new Prisma.Decimal(0)
    };
  }
}

