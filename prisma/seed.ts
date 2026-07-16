import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { clerkId: "seed-user" },
    update: {},
    create: {
      clerkId: "seed-user",
      email: "seed@example.com",
      name: "Seed User"
    }
  });

  const existingCourse = await prisma.course.findFirst({
    where: { userId: user.id, title: "Seeded Course" }
  });

  if (!existingCourse) {
    await prisma.course.create({
      data: {
        userId: user.id,
        title: "Seeded Course",
        description: "A starter course generated for local development.",
        topic: "Productivity",
        audience: "Builders",
        difficulty: "BEGINNER",
        language: "English",
        tone: "Friendly",
        lessonCount: 3,
        duration: "2 weeks",
        status: "DRAFT"
      }
    });
  }

  console.log("Seeded database with sample user and course.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
