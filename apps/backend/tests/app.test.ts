import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { LocalAiService } from "../src/modules/ai/local-ai.service.js";

describe("Swapy Campus API", () => {
  it("exposes a health endpoint", async () => {
    const app = createApp();

    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toMatchObject({
      status: "ok",
      stack: "node-express-prisma-postgresql"
    });
  });

  it("returns repair advice from the local AI adapter", async () => {
    const ai = new LocalAiService();

    const advice = await ai.analyzeRepair("Arduino Uno", "The board is not detected by USB.");
    const cost = await ai.predictCost("Arduino Uno", "The board is not detected by USB.");

    expect(advice.recommendation.toLowerCase()).toContain("usb");
    expect(cost.replacementCost.toString()).toBe("30");
  });
});

