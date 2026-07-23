import { PrismaClient, RepairTicketStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.repairTicket.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      id: "u1",
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@campus.edu",
      passwordHash: "$2a$10$dummyHashForTesting123456789012345678",
      campus: "ENGINEERING",
      role: "STUDENT",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: "u2",
      firstName: "Alex",
      lastName: "Rodriguez",
      email: "alex.r@campus.edu",
      passwordHash: "$2a$10$dummyHashForTesting123456789012345678",
      campus: "SCIENCE",
      role: "STUDENT",
    },
  });

  console.log(`Created users: ${user1.id}, ${user2.id}`);

  // Create test repair tickets
  const tickets = [
    {
      userId: "u1",
      deviceName: "Logitech MX Master 3",
      problemDescription: "The scroll wheel button is stuck and clicking noise is loud.",
      aiRecommendation:
        "Clean dust and inspect the mechanical spring latch under the wheel. Disconnect USB battery before opening.",
      repairDifficulty: "medium",
      estimatedRepairCost: 8.0,
      estimatedResaleValue: 45.0,
      estimatedReplacementCost: 99.0,
      status: RepairTicketStatus.AI_RECOMMENDED,
    },
    {
      userId: "u1",
      deviceName: "MacBook Air 2020 M1",
      problemDescription:
        "The laptop runs extremely hot and the fan is constantly spinning loudly.",
      aiRecommendation:
        "Clean dust from vents while the device is powered off. Check whether fan noise changes under load. Avoid puncturing battery.",
      repairDifficulty: "medium",
      estimatedRepairCost: 35.0,
      estimatedResaleValue: 380.0,
      estimatedReplacementCost: 899.0,
      status: RepairTicketStatus.OPEN,
    },
    {
      userId: "u2",
      deviceName: "Arduino Uno R3",
      problemDescription:
        "Board is not recognized via USB. The power LED turns on but no serial port appears.",
      aiRecommendation:
        "Try another USB data cable and port. Check if it appears in the device manager. Avoid short circuits.",
      repairDifficulty: "low",
      estimatedRepairCost: 5.0,
      estimatedResaleValue: 15.0,
      estimatedReplacementCost: 30.0,
      status: RepairTicketStatus.IN_PROGRESS,
    },
    {
      userId: "u1",
      deviceName: "iPhone 12 Mini",
      problemDescription:
        "Cracked front screen after a drop. Touch works intermittently on the left side.",
      aiRecommendation:
        "Verify if touch digitizer functions. Remove screen cautiously using suction cup. Beware of swollen battery or glass fragments.",
      repairDifficulty: "high",
      estimatedRepairCost: 55.0,
      estimatedResaleValue: 220.0,
      estimatedReplacementCost: 699.0,
      status: RepairTicketStatus.RESOLVED,
    },
    {
      userId: "u2",
      deviceName: "Sony WH-1000XM4 Headphones",
      problemDescription: "Left earcup has no audio output. Right side works perfectly.",
      aiRecommendation:
        "Check internal ribbon cable connection between earcups. Test with known-good audio source. Disconnect power before opening.",
      repairDifficulty: "medium",
      estimatedRepairCost: 12.0,
      estimatedResaleValue: 180.0,
      estimatedReplacementCost: 349.0,
      status: RepairTicketStatus.AI_RECOMMENDED,
    },
  ];

  for (const ticket of tickets) {
    await prisma.repairTicket.create({ data: ticket });
  }

  console.log(`Created ${tickets.length} repair tickets`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
