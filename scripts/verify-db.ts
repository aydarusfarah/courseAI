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

  const created = await prisma.course.create({
    data: {
      userId: user.id,
      title: "Verification Course",
      description: "Created for DB verification",
      topic: "Testing",
      audience: "Developers",
      difficulty: "BEGINNER",
      language: "English",
      tone: "Friendly",
      lessonCount: 2,
      duration: "1 week",
      status: "DRAFT"
    }
  });

  const updated = await prisma.course.update({
    where: { id: created.id },
    data: { title: "Verification Course Updated" }
  });

  const archived = await prisma.course.update({
    where: { id: created.id },
    data: { archivedAt: new Date(), status: "DRAFT" }
  });

  const restored = await prisma.course.update({
    where: { id: created.id },
    data: { archivedAt: null }
  });

  await prisma.course.update({
    where: { id: created.id },
    data: { deletedAt: new Date() }
  });

  console.log(JSON.stringify({
    createdId: created.id,
    updatedTitle: updated.title,
    archived: Boolean(archived.archivedAt),
    restored: Boolean(restored.archivedAt),
    deleted: true
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
