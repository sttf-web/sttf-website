import { prisma } from "../lib/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined. Run this script with the correct environment file."
  );
}

const COMMITTEES = [
  {
    slug: "appeals",
    name: "لجنة الاستئناف",
    order: 1,
  },
  {
    slug: "disciplinary",
    name: "لجنة الانضباط",
    order: 2,
  },
  {
    slug: "players-coaches",
    name: "لجنة اللاعبين والمدربين",
    order: 3,
  },
  {
    slug: "competitions",
    name: "لجنة المسابقات",
    order: 4,
  },
  {
    slug: "referees",
    name: "لجنة الحكام",
    order: 5,
  },
  {
    slug: "paralympic",
    name: "لجنة البارالمبية",
    order: 6,
  },
  {
    slug: "national-teams",
    name: "لجنة المنتخبات",
    order: 7,
  },
  {
    slug: "financial-disputes",
    name: "لجنة فض المنازعات المالية",
    order: 8,
  },
];

async function main() {
  console.log("Seeding committee categories...");

  for (const committee of COMMITTEES) {
    await prisma.committee.upsert({
      where: {
        slug: committee.slug,
      },
      update: {
        name: committee.name,
        order: committee.order,
        published: true,
      },
      create: {
        slug: committee.slug,
        name: committee.name,
        order: committee.order,
        published: true,
      },
    });

    console.log(`✓ ${committee.name}`);
  }

  console.log("Committee categories seeded successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("Committee seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });