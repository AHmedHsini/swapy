import { Prisma } from "@prisma/client";

export type RepairAdvice = {
  recommendation: string;
  difficulty: "low" | "medium" | "high";
  safetyNotes: string[];
};

export type CostPrediction = {
  repairCost: Prisma.Decimal;
  resaleValue: Prisma.Decimal;
  replacementCost: Prisma.Decimal;
};

export class LocalAiService {
  analyzeRepair(deviceName: string, problemDescription: string): RepairAdvice {
    const text = `${deviceName} ${problemDescription}`.toLowerCase();
    const steps = [
      "Document the symptoms before replacing parts.",
      "Check cables, ports, power source, and visible physical damage.",
      "Test with a known-good charger, cable, or computer when possible."
    ];
    const safetyNotes = ["Disconnect power before opening or testing the device."];
    let difficulty: RepairAdvice["difficulty"] = "medium";

    if (text.includes("arduino") || text.includes("board") || text.includes("usb")) {
      steps.push(
        "Try another USB data cable and port.",
        "Check whether the board appears in the operating system device manager.",
        "Reinstall drivers only after the physical checks pass."
      );
    }

    if (text.includes("fan") || text.includes("noise") || text.includes("laptop")) {
      steps.push(
        "Clean dust from vents while the device is powered off.",
        "Check whether the fan noise changes under load.",
        "Replace the fan if grinding continues after cleaning."
      );
    }

    if (text.includes("battery") || text.includes("smoke") || text.includes("burn")) {
      difficulty = "high";
      safetyNotes.push("Stop using the item if you see swelling, smoke, or burn marks.");
    }

    return {
      recommendation: steps.join(" "),
      difficulty,
      safetyNotes
    };
  }

  predictCost(deviceName: string, problemDescription: string): CostPrediction {
    const text = `${deviceName} ${problemDescription}`.toLowerCase();
    let repairCost = new Prisma.Decimal("8.00");
    let resaleValue = new Prisma.Decimal("18.00");
    let replacementCost = new Prisma.Decimal("35.00");

    if (text.includes("arduino") || text.includes("sensor") || text.includes("board")) {
      repairCost = new Prisma.Decimal("5.00");
      resaleValue = new Prisma.Decimal("15.00");
      replacementCost = new Prisma.Decimal("30.00");
    } else if (text.includes("laptop") || text.includes("phone")) {
      repairCost = new Prisma.Decimal("35.00");
      resaleValue = new Prisma.Decimal("120.00");
      replacementCost = new Prisma.Decimal("400.00");
    } else if (text.includes("headphone") || text.includes("earbud")) {
      repairCost = new Prisma.Decimal("6.00");
      resaleValue = new Prisma.Decimal("12.00");
      replacementCost = new Prisma.Decimal("45.00");
    }

    if (text.includes("burn") || text.includes("water") || text.includes("broken screen")) {
      repairCost = repairCost.mul("1.8");
      resaleValue = resaleValue.mul("0.6");
    }

    return { repairCost, resaleValue, replacementCost };
  }
}

