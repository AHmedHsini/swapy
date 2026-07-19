import { RepairTicketStatus } from "@prisma/client";

import { HttpError } from "../../common/http-error.js";
import { prisma } from "../../config/prisma.js";
import { LocalAiService } from "../ai/local-ai.service.js";
import type { ListRepairTicketsQuery, SubmitRepairTicketInput } from "./repair.schemas.js";

export class RepairService {
  constructor(private readonly aiService = new LocalAiService()) {}

  async submitTicket(input: SubmitRepairTicketInput) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const advice = await this.aiService.analyzeRepair(input.deviceName, input.problemDescription);
    const cost = await this.aiService.predictCost(input.deviceName, input.problemDescription);

    return prisma.repairTicket.create({
      data: {
        userId: input.userId,
        deviceName: input.deviceName,
        problemDescription: input.problemDescription,
        aiRecommendation: `${advice.recommendation} Safety: ${advice.safetyNotes.join(" ")}`,
        repairDifficulty: advice.difficulty,
        estimatedRepairCost: cost.repairCost,
        estimatedResaleValue: cost.resaleValue,
        estimatedReplacementCost: cost.replacementCost,
        status: RepairTicketStatus.AI_RECOMMENDED
      }
    });
  }

  async getTicket(id: string) {
    const ticket = await prisma.repairTicket.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!ticket) {
      throw new HttpError(404, "Repair ticket not found");
    }
    return ticket;
  }

  async listTickets(query: ListRepairTicketsQuery) {
    const where: Record<string, string> = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    return prisma.repairTicket.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async cancelTicket(id: string) {
    await this.getTicket(id);
    return prisma.repairTicket.update({
      where: { id },
      data: { status: RepairTicketStatus.CANCELLED }
    });
  }

  async updateStatus(id: string, status: RepairTicketStatus) {
    await this.getTicket(id);
    return prisma.repairTicket.update({
      where: { id },
      data: { status }
    });
  }
}

