import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";

export type CourseListItem = Prisma.CourseGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    status: true;
    topic: true;
    difficulty: true;
    updatedAt: true;
    createdAt: true;
    deletedAt: true;
    lessonCount: true;
    _count: { select: { modules: true } };
  };
}>;

export async function listCoursesForUser(userId: string) {
  return prisma.course.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      topic: true,
      difficulty: true,
      updatedAt: true,
      createdAt: true,
      archivedAt: true,
      deletedAt: true,
      lessonCount: true,
      _count: { select: { modules: true } }
    }
  });
}

export async function getCourseDetailsForUser(courseId: string, userId: string) {
  return prisma.course.findFirst({
    where: { id: courseId, userId, deletedAt: null },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { createdAt: "asc" },
            include: {
              questionSet: { include: { questions: true } },
              flashcards: true,
              assignments: true
            }
          }
        }
      },
      certificate: true
    }
  });
}

export async function updateCourseTitle(courseId: string, userId: string, title: string) {
  return prisma.course.updateMany({
    where: { id: courseId, userId, deletedAt: null },
    data: { title }
  });
}

export async function updateCourseContent(courseId: string, userId: string, payload: { title: string; description: string; topic: string; audience: string; difficulty: string; language: string; tone: string; status?: string }) {
  return prisma.course.updateMany({
    where: { id: courseId, userId, deletedAt: null },
    data: {
      title: payload.title,
      description: payload.description,
      topic: payload.topic,
      audience: payload.audience,
      difficulty: payload.difficulty as Prisma.EnumDifficultyFieldUpdateOperationsInput["set"],
      language: payload.language,
      tone: payload.tone,
      status: payload.status as Prisma.EnumCourseStatusFieldUpdateOperationsInput["set"]
    }
  });
}

export async function createCourse(userId: string, payload: { title: string; description?: string; topic?: string; audience?: string; difficulty?: string; language?: string; tone?: string; lessonCount?: number; duration?: string; status?: string }) {
  return prisma.course.create({
    data: {
      userId,
      title: payload.title || "New Course",
      description: payload.description || "",
      topic: payload.topic || "General",
      audience: payload.audience || "Learners",
      difficulty: (payload.difficulty as Prisma.CourseCreateInput["difficulty"]) || "BEGINNER",
      language: payload.language || "English",
      tone: payload.tone || "Friendly",
      lessonCount: payload.lessonCount ?? 1,
      duration: payload.duration || "1 week",
      status: (payload.status as Prisma.CourseCreateInput["status"]) || "DRAFT"
    }
  });
}

export async function archiveCourse(courseId: string, userId: string) {
  return prisma.course.updateMany({
    where: { id: courseId, userId, deletedAt: null },
    data: { archivedAt: new Date(), status: "DRAFT" }
  });
}

export async function restoreCourse(courseId: string, userId: string) {
  return prisma.course.updateMany({
    where: { id: courseId, userId, deletedAt: null },
    data: { archivedAt: null, deletedAt: null, status: "DRAFT" }
  });
}

export async function deleteCourse(courseId: string, userId: string) {
  return prisma.course.updateMany({
    where: { id: courseId, userId, deletedAt: null },
    data: { deletedAt: new Date() }
  });
}

export async function duplicateCourse(courseId: string, userId: string) {
  const original = await prisma.course.findFirst({
    where: { id: courseId, userId, deletedAt: null },
    include: { modules: { include: { lessons: true } } }
  });

  if (!original) return null;

  return prisma.$transaction(async (tx) => {
    const duplicated = await tx.course.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        description: original.description,
        topic: original.topic,
        audience: original.audience,
        difficulty: original.difficulty,
        language: original.language,
        tone: original.tone,
        lessonCount: original.lessonCount,
        duration: original.duration,
        status: "DRAFT",
        coverImageUrl: original.coverImageUrl
      }
    });

    for (const module of original.modules) {
      const createdModule = await tx.module.create({
        data: {
          courseId: duplicated.id,
          title: module.title,
          position: module.position
        }
      });

      for (const lesson of module.lessons) {
        await tx.lesson.create({
          data: {
            moduleId: createdModule.id,
            title: lesson.title,
            content: lesson.content,
            examples: lesson.examples,
            exercises: lesson.exercises
          }
        });
      }
    }

    return duplicated;
  });
}

export async function createRevision(courseId: string, userId: string, title: string, content: string, author: string) {
  const course = await prisma.course.findFirst({ where: { id: courseId, userId, deletedAt: null } });
  if (!course) return null;

  // Snapshot captures the current top-level course fields as JSON
  const snapshot = JSON.stringify({
    title: course.title,
    description: course.description,
    topic: course.topic,
    audience: course.audience,
    difficulty: course.difficulty,
    language: course.language,
    tone: course.tone,
    status: course.status
  });

  return prisma.courseRevision.create({
    data: {
      courseId,
      title,
      content,
      snapshot,
      author
    }
  });
}

export async function createModule(courseId: string, userId: string, title: string) {
  const course = await prisma.course.findFirst({ where: { id: courseId, userId, deletedAt: null } });
  if (!course) return null;

  const nextPosition = await prisma.module.count({ where: { courseId } });
  return prisma.module.create({
    data: {
      courseId,
      title,
      position: nextPosition + 1
    }
  });
}

export async function updateModuleTitle(moduleId: string, userId: string, title: string) {
  const module = await prisma.module.findFirst({ where: { id: moduleId, course: { userId, deletedAt: null } } });
  if (!module) return null;
  return prisma.module.update({ where: { id: moduleId }, data: { title } });
}

export async function deleteModule(moduleId: string, userId: string) {
  const module = await prisma.module.findFirst({ where: { id: moduleId, course: { userId, deletedAt: null } } });
  if (!module) return null;
  return prisma.module.delete({ where: { id: moduleId } });
}

export async function createLesson(moduleId: string, userId: string, title: string) {
  const module = await prisma.module.findFirst({ where: { id: moduleId, course: { userId, deletedAt: null } } });
  if (!module) return null;
  const _nextPosition = await prisma.lesson.count({ where: { moduleId } });
  return prisma.lesson.create({
    data: {
      moduleId,
      title,
      content: "",
      examples: "",
      exercises: ""
    }
  });
}

export async function updateLesson(moduleId: string, userId: string, lessonId: string, payload: { title?: string; content?: string; examples?: string; exercises?: string }) {
  const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, module: { course: { userId, deletedAt: null } } } });
  if (!lesson) return null;
  return prisma.lesson.update({ where: { id: lessonId }, data: { ...payload } });
}

export async function deleteLesson(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, module: { course: { userId, deletedAt: null } } } });
  if (!lesson) return null;
  return prisma.lesson.delete({ where: { id: lessonId } });
}

export async function reorderLessons(moduleId: string, userId: string, lessonOrder: string[]) {
  const module = await prisma.module.findFirst({ where: { id: moduleId, course: { userId, deletedAt: null } } });
  if (!module) return null;

  return prisma.$transaction(async (tx) => {
    for (const [index, lessonId] of lessonOrder.entries()) {
      await tx.lesson.updateMany({ where: { id: lessonId, moduleId }, data: { position: index } });
    }
  });
}

export async function moveLessonToModule(lessonId: string, userId: string, targetModuleId: string) {
  const lesson = await prisma.lesson.findFirst({ where: { id: lessonId, module: { course: { userId, deletedAt: null } } } });
  if (!lesson) return null;
  const targetModule = await prisma.module.findFirst({ where: { id: targetModuleId, course: { userId, deletedAt: null } } });
  if (!targetModule) return null;

  return prisma.lesson.update({ where: { id: lessonId }, data: { moduleId: targetModuleId } });
}
