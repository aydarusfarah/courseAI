import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export const courseDetailInclude = {
  modules: {
    orderBy: { position: "asc" as const },
    include: {
      lessons: {
        orderBy: { createdAt: "asc" as const },
        include: {
          questionSet: {
            include: {
              questions: true
            }
          },
          flashcards: true,
          assignments: true
        }
      }
    }
  },
  certificate: true
} satisfies Prisma.CourseInclude;

export type CourseWithDetails = Prisma.CourseGetPayload<{ include: typeof courseDetailInclude }>;

export interface CoursePreviewData {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  language: string;
  modules: Array<{
    title: string;
    lessons: string[];
  }>;
  quizzes: Array<{ question: string; answer: string }>;
  flashcards: Array<{ front: string; back: string }>;
  assignments: Array<{ title: string; details: string }>;
  certificateContent?: string;
}

export function serializeCoursePreview(course: CourseWithDetails): CoursePreviewData {
  const quizzes: CoursePreviewData["quizzes"] = [];
  const flashcards: CoursePreviewData["flashcards"] = [];
  const assignments: CoursePreviewData["assignments"] = [];

  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      if (lesson.questionSet) {
        for (const question of lesson.questionSet.questions) {
          quizzes.push({ question: question.prompt, answer: question.answer });
        }
      }
      for (const card of lesson.flashcards) {
        flashcards.push({ front: card.front, back: card.back });
      }
      for (const assignment of lesson.assignments) {
        assignments.push({ title: assignment.title, details: assignment.description });
      }
    }
  }

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    topic: course.topic,
    difficulty: course.difficulty,
    language: course.language,
    modules: course.modules.map((module) => ({
      title: module.title,
      lessons: module.lessons.map((lesson) => lesson.title)
    })),
    quizzes,
    flashcards,
    assignments,
    certificateContent: course.certificate?.content
  };
}

export async function getCourseForUser(courseId: string, userId: string): Promise<CourseWithDetails | null> {
  return prisma.course.findFirst({
    where: { id: courseId, userId, deletedAt: null },
    include: courseDetailInclude
  });
}
