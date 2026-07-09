import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

import bcrypt from "bcryptjs";

const categoryNames = [
  "Textbooks & Manuals",
  "Electronics & Gadgets",
  "Fashion & Accessories",
  "Furniture & Room Items",
  "Services",
  "Others",
];

async function main() {
  // Seed Categories
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed Admin User
  const adminEmail = "admin@unimart.com";
  const passwordHash = await bcrypt.hash("AdminSecret123!", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      isVerified: true,
    },
    create: {
      name: "Unimart Admin",
      email: adminEmail,
      phoneNumber: "+2340000000000",
      passwordHash,
      role: "ADMIN",
      isVerified: true,
      department: "Administration",
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
