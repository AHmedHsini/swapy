import { PrismaClient, UserRole, Campus, ItemCondition, ListingType, ListingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Swapy Campus database...");

  // Clear existing data
  await prisma.sustainabilityImpactEvent.deleteMany();
  await prisma.marketplaceTransaction.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash("password123", 12);

  const sarah = await prisma.user.create({
    data: {
      id: "u1",
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah.chen@campus.edu",
      passwordHash,
      campus: Campus.ENGINEERING,
      reputationScore: 4.95,
      totalPoints: 1250,
      role: UserRole.STUDENT
    }
  });

  const alex = await prisma.user.create({
    data: {
      id: "u2",
      firstName: "Alex",
      lastName: "Rodriguez",
      email: "alex.rodriguez@campus.edu",
      passwordHash,
      campus: Campus.SCIENCE,
      reputationScore: 4.80,
      totalPoints: 920,
      role: UserRole.STUDENT
    }
  });

  const emma = await prisma.user.create({
    data: {
      id: "u3",
      firstName: "Emma",
      lastName: "Watson",
      email: "emma.watson@campus.edu",
      passwordHash,
      campus: Campus.MAIN,
      reputationScore: 4.70,
      totalPoints: 780,
      role: UserRole.STUDENT
    }
  });

  const michael = await prisma.user.create({
    data: {
      id: "u4",
      firstName: "Michael",
      lastName: "Scott",
      email: "michael.scott@campus.edu",
      passwordHash,
      campus: Campus.BUSINESS,
      reputationScore: 4.10,
      totalPoints: 340,
      role: UserRole.STUDENT
    }
  });

  console.log("Users created.");

  // Create Trust Score Snapshots
  await prisma.trustScoreSnapshot.create({
    data: {
      userId: sarah.id,
      score: 4.95,
      riskLevel: "LOW",
      completedTransactions: 28,
      averageRating: 4.90
    }
  });

  await prisma.trustScoreSnapshot.create({
    data: {
      userId: alex.id,
      score: 4.80,
      riskLevel: "LOW",
      completedTransactions: 19,
      averageRating: 4.75
    }
  });

  await prisma.trustScoreSnapshot.create({
    data: {
      userId: emma.id,
      score: 4.70,
      riskLevel: "LOW",
      completedTransactions: 14,
      averageRating: 4.65
    }
  });

  await prisma.trustScoreSnapshot.create({
    data: {
      userId: michael.id,
      score: 4.10,
      riskLevel: "MEDIUM",
      completedTransactions: 5,
      averageRating: 4.00
    }
  });

  console.log("Trust snapshots created.");

  // Create Categories
  const electronics = await prisma.category.create({
    data: { id: "c1", name: "Electronics", slug: "electronics" }
  });

  const books = await prisma.category.create({
    data: { id: "c2", name: "Books", slug: "books" }
  });

  const home = await prisma.category.create({
    data: { id: "c3", name: "Home & Kitchen", slug: "home-kitchen" }
  });

  const tools = await prisma.category.create({
    data: { id: "c4", name: "Tools & Lab", slug: "tools-lab" }
  });

  const clothing = await prisma.category.create({
    data: { id: "c5", name: "Clothing", slug: "clothing" }
  });

  console.log("Categories created.");

  // Create Listings
  await prisma.listing.create({
    data: {
      id: "l1",
      userId: sarah.id,
      categoryId: tools.id,
      title: "Arduino Uno Starter Kit",
      description: "Used for one semester in ECE 101. Includes board, breadboard, resistors, and sensors.",
      condition: ItemCondition.LIKE_NEW,
      listingType: ListingType.SALE,
      price: 15.00,
      location: "Engineering Quad",
      status: ListingStatus.PUBLISHED
    }
  });

  await prisma.listing.create({
    data: {
      id: "l2",
      userId: alex.id,
      categoryId: electronics.id,
      title: "Dell 24\" IPS Monitor",
      description: "Upgraded to a dual-monitor setup. Screen is in perfect condition, power cable included.",
      condition: ItemCondition.GOOD,
      listingType: ListingType.EXCHANGE,
      location: "Science Library",
      status: ListingStatus.PUBLISHED
    }
  });

  await prisma.listing.create({
    data: {
      id: "l3",
      userId: emma.id,
      categoryId: books.id,
      title: "Organic Chemistry Study Guide",
      description: "12th Edition textbook, has minor highlights but otherwise perfectly readable.",
      condition: ItemCondition.FAIR,
      listingType: ListingType.DONATION,
      location: "Main Campus Center",
      status: ListingStatus.PUBLISHED
    }
  });

  await prisma.listing.create({
    data: {
      id: "l4",
      userId: sarah.id,
      categoryId: books.id,
      title: "Calculus: Early Transcendentals",
      description: "Essential textbook. Donating to any student who needs it for Math 1A.",
      condition: ItemCondition.GOOD,
      listingType: ListingType.DONATION,
      location: "Science Library",
      status: ListingStatus.PUBLISHED
    }
  });

  console.log("Listings created.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
