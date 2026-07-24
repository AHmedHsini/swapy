import "dotenv/config";

import bcrypt from "bcryptjs";
import { Campus, UserRole } from "@prisma/client";

import { prisma } from "./prisma.js";

const demoUsers = [
  {
    firstName: "Admin",
    lastName: "Swapy",
    email: "admin@gmail.com",
    password: "admin@2026",
    role: UserRole.ADMIN,
  },
  {
    firstName: "Student",
    lastName: "One",
    email: "student1@gmail.com",
    password: "student@1",
    role: UserRole.STUDENT,
  },
  {
    firstName: "Student",
    lastName: "Two",
    email: "student2@gmail.com",
    password: "student@2",
    role: UserRole.STUDENT,
  },
];

async function seedDemoUsers() {
  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash,
        role: user.role,
        campus: Campus.OTHER,
      },
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        passwordHash,
        role: user.role,
        campus: Campus.OTHER,
      },
    });
  }
}

seedDemoUsers()
  .then(async () => {
    console.log("Demo auth users seeded.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
