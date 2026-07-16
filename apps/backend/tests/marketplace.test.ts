import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Marketplace Module Integration", () => {
  it("allows retrieving listings and filtering them", async () => {
    const app = createApp();

    // 1. Get listings
    const resListings = await request(app).get("/api/marketplace/listings").expect(200);
    expect(Array.isArray(resListings.body)).toBe(true);

    // 2. Filter listings by search
    const resFiltered = await request(app)
      .get("/api/marketplace/listings?search=Arduino")
      .expect(200);
    expect(resFiltered.body.length).toBeGreaterThan(0);
    expect(resFiltered.body[0].title).toContain("Arduino");
  });

  it("handles the complete marketplace transaction workflow", async () => {
    const app = createApp();

    // Setup: Ensure listing l1 is published and has u1 as owner
    await prisma.listing.update({
      where: { id: "l1" },
      data: { status: "PUBLISHED" }
    });

    // Reset user points
    await prisma.user.update({
      where: { id: "u1" },
      data: { totalPoints: 1250, reputationScore: 4.95 }
    });
    await prisma.user.update({
      where: { id: "u2" },
      data: { totalPoints: 920, reputationScore: 4.80 }
    });

    // 1. Create a transaction request (u2 requests l1 owned by u1)
    const resCreate = await request(app)
      .post("/api/marketplace/transactions")
      .send({
        listingId: "l1",
        requesterId: "u2",
        transactionType: "SALE",
        agreedPrice: 15.00,
        scheduledLocation: "Engineering Quad"
      })
      .expect(201);

    expect(resCreate.body).toMatchObject({
      listingId: "l1",
      requesterId: "u2",
      ownerId: "u1",
      status: "REQUESTED",
      transactionType: "SALE"
    });

    const txId = resCreate.body.id;

    // 2. Accept the transaction request
    const resAccept = await request(app)
      .patch(`/api/marketplace/transactions/${txId}/status`)
      .send({ status: "ACCEPTED" })
      .expect(200);

    expect(resAccept.body.status).toBe("ACCEPTED");

    // 3. Complete the transaction request (Verify points and sustainability logs update)
    const resComplete = await request(app)
      .patch(`/api/marketplace/transactions/${txId}/status`)
      .send({ status: "COMPLETED" })
      .expect(200);

    expect(resComplete.body.status).toBe("COMPLETED");
    expect(resComplete.body.completedAt).not.toBeNull();

    // 4. Verify Database side effects
    // Verify listing is now completed
    const listing = await prisma.listing.findUnique({ where: { id: "l1" } });
    expect(listing?.status).toBe("COMPLETED");

    // Verify user points reward (+100 to both)
    const owner = await prisma.user.findUnique({ where: { id: "u1" } });
    const requester = await prisma.user.findUnique({ where: { id: "u2" } });
    expect(owner?.totalPoints).toBe(1350);
    expect(requester?.totalPoints).toBe(1020);

    // Verify sustainability events are generated
    const impactEvents = await prisma.sustainabilityImpactEvent.findMany({
      where: { transactionId: txId }
    });
    expect(impactEvents.length).toBe(2);
    expect(impactEvents.some(e => e.userId === "u1")).toBe(true);
    expect(impactEvents.some(e => e.userId === "u2")).toBe(true);
  });
});
