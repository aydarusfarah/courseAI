import { prisma } from "./prisma";
import { complete } from "./ai";
import { ensurePlanAccess, incrementUsage } from "./billing";
import {
  CourseGenerationInput,
  outlinePrompt,
  lessonPrompt,
  quizPrompt,
  flashcardsPrompt,
  assignmentPrompt,
  projectPrompt,
  certificatePrompt
} from "./prompts";
import type { RequestAction, RequestStatus } from "@prisma/client";

const retryCount = 2;

export type GenerationStep =
  | "outline"
  | "lessons"
  | "quizzes"
  | "flashcards"
  | "assignments"
  | "project"
  | "certificate"
  | "complete";

export interface GenerationOptions {
  onProgress?: (step: GenerationStep, percent: number) => void;
}

async function retry<T>(fn: () => Promise<T>, attempts = retryCount): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

function parseJson<T>(text: string): T {
  try {
    const cleaned = text.trim();
    const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : cleaned;

    const firstObject = candidate.indexOf("{");
    const firstArray = candidate.indexOf("[");
    const start = firstObject === -1 ? firstArray : firstArray === -1 ? firstObject : Math.min(firstObject, firstArray);

    if (start === -1) {
      throw new Error("No JSON payload found in AI response");
    }

    const openChar = candidate[start];
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;

    for (let index = start; index < candidate.length; index += 1) {
      const current = candidate[index];
      if (current === openChar) depth += 1;
      if (current === closeChar) depth -= 1;
      if (depth === 0 && index > start) {
        return JSON.parse(candidate.slice(start, index + 1)) as T;
      }
    }

    return JSON.parse(candidate.slice(start)) as T;
  } catch (error) {
    throw new Error("Failed to parse AI JSON response: " + (error instanceof Error ? error.message : String(error)));
  }
}

async function runAIStep(
  userId: string,
  courseId: string | null,
  action: RequestAction,
  prompt: string,
  run: () => Promise<string>
): Promise<string> {
  try {
    const response = await retry(run);
    await prisma.aIRequest.create({
      data: {
        userId,
        courseId: courseId ?? undefined,
        action,
        prompt: prompt.slice(0, 10000),
        response: response.slice(0, 50000),
        tokens: 0,
        status: "COMPLETED"
      }
    });
    return response;
  } catch (error) {
    await prisma.aIRequest.create({
      data: {
        userId,
        courseId: courseId ?? undefined,
        action,
        prompt: prompt.slice(0, 10000),
        response: error instanceof Error ? error.message : String(error),
        tokens: 0,
        status: "FAILED" as RequestStatus
      }
    });
    throw error;
  }
}

function getEnabledSteps(input: CourseGenerationInput): GenerationStep[] {
  const steps: GenerationStep[] = ["outline", "lessons"];
  if (input.quizzes) steps.push("quizzes");
  if (input.flashcards) steps.push("flashcards");
  if (input.assignments) steps.push("assignments");
  if (input.finalProject) steps.push("project");
  if (input.certificate) steps.push("certificate");
  steps.push("complete");
  return steps;
}

function reportProgress(
  options: GenerationOptions | undefined,
  step: GenerationStep,
  enabledSteps: GenerationStep[]
) {
  const index = enabledSteps.indexOf(step);
  const percent = Math.round(((index + 1) / enabledSteps.length) * 100);
  options?.onProgress?.(step, percent);
}

export async function generateCourse(
  input: CourseGenerationInput & { userId: string },
  options?: GenerationOptions
): Promise<{ courseId: string }> {
  const { snapshot } = await ensurePlanAccess(input.userId, { requireAi: true });
  if (snapshot.plan === "FREE") {
    await incrementUsage(input.userId, "AI_REQUEST");
  }

  const enabledSteps = getEnabledSteps(input);

  reportProgress(options, "outline", enabledSteps);
  const outlinePromptText = outlinePrompt(input);
  const outlineResponse = await runAIStep(input.userId, null, "OUTLINE", outlinePromptText, () =>
    complete(outlinePromptText)
  );
  const outlineData = parseJson<{
    description: string;
    learningObjectives: string[];
    modules: Array<{ title: string; lessons: { title: string }[] }>;
  }>(outlineResponse);

  const course = await prisma.course.create({
    data: {
      userId: input.userId,
      title: input.title,
      description: outlineData.description || input.description,
      topic: input.topic,
      audience: input.audience,
      difficulty: input.difficulty,
      language: input.language,
      tone: input.tone,
      lessonCount: input.modules * input.lessonsPerModule,
      duration: input.duration,
      status: "DRAFT",
      modules: {
        create: outlineData.modules.map((module, index) => ({
          title: module.title,
          position: index + 1,
          lessons: {
            create: module.lessons.map((lesson) => ({
              title: lesson.title,
              content: "",
              examples: "",
              exercises: ""
            }))
          }
        }))
      }
    }
  });

  const lessonIndexList = outlineData.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ module: module.title, title: lesson.title }))
  );

  reportProgress(options, "lessons", enabledSteps);
  const lessonPromptText = lessonPrompt(input, outlineData.modules);
  const lessonResponse = await runAIStep(input.userId, course.id, "LESSONS", lessonPromptText, () =>
    complete(lessonPromptText)
  );
  const lessonData = parseJson<{
    modules: Array<{
      title: string;
      lessons: Array<{
        title: string;
        introduction: string;
        explanation: string;
        realWorldExample: string;
        bestPractices: string;
        commonMistakes: string;
        summary: string;
        exercise: string;
      }>;
    }>;
  }>(lessonResponse);

  for (const module of lessonData.modules) {
    const prismaModule = await prisma.module.findFirst({ where: { courseId: course.id, title: module.title } });
    if (!prismaModule) continue;
    for (const lesson of module.lessons) {
      const prismaLesson = await prisma.lesson.findFirst({ where: { moduleId: prismaModule.id, title: lesson.title } });
      if (!prismaLesson) continue;
      await prisma.lesson.update({
        where: { id: prismaLesson.id },
        data: {
          content: `Introduction:\n${lesson.introduction}\n\nExplanation:\n${lesson.explanation}\n\nReal-world example:\n${lesson.realWorldExample}\n\nBest practices:\n${lesson.bestPractices}\n\nCommon mistakes:\n${lesson.commonMistakes}\n\nSummary:\n${lesson.summary}`,
          examples: lesson.realWorldExample,
          exercises: input.exercises ? lesson.exercise : ""
        }
      });
    }
  }

  if (input.quizzes) {
    reportProgress(options, "quizzes", enabledSteps);
    const quizPromptText = quizPrompt(input, lessonIndexList);
    const quizResponse = await runAIStep(input.userId, course.id, "QUIZ", quizPromptText, () =>
      complete(quizPromptText)
    );
    const quizData = parseJson<{
      quizzes: Array<{ lessonTitle: string; question: string; answer: string; options: string[] }>;
    }>(quizResponse);

    for (const quiz of quizData.quizzes) {
      const lesson = await prisma.lesson.findFirst({
        where: { module: { courseId: course.id }, title: quiz.lessonTitle }
      });
      if (!lesson) continue;

      const existingQuiz = await prisma.quiz.findUnique({ where: { lessonId: lesson.id } });
      if (existingQuiz) {
        await prisma.question.create({
          data: {
            quizId: existingQuiz.id,
            prompt: quiz.question,
            answer: quiz.answer,
            options: quiz.options
          }
        });
      } else {
        await prisma.quiz.create({
          data: {
            lessonId: lesson.id,
            questions: {
              create: {
                prompt: quiz.question,
                answer: quiz.answer,
                options: quiz.options
              }
            }
          }
        });
      }
    }
  }

  if (input.flashcards) {
    reportProgress(options, "flashcards", enabledSteps);
    const flashcardsPromptText = flashcardsPrompt(input, lessonIndexList);
    const flashcardsResponse = await runAIStep(input.userId, course.id, "FLASHCARDS", flashcardsPromptText, () =>
      complete(flashcardsPromptText)
    );
    const flashcardsData = parseJson<{
      flashcards: Array<{ lessonTitle: string; front: string; back: string }>;
    }>(flashcardsResponse);

    for (const card of flashcardsData.flashcards) {
      const lesson = await prisma.lesson.findFirst({
        where: { module: { courseId: course.id }, title: card.lessonTitle }
      });
      if (!lesson) continue;
      await prisma.flashcard.create({
        data: {
          lessonId: lesson.id,
          front: card.front,
          back: card.back
        }
      });
    }
  }

  if (input.assignments) {
    reportProgress(options, "assignments", enabledSteps);
    const assignmentsPromptText = assignmentPrompt(input, lessonIndexList);
    const assignmentsResponse = await runAIStep(input.userId, course.id, "ASSIGNMENTS", assignmentsPromptText, () =>
      complete(assignmentsPromptText)
    );
    const assignmentsData = parseJson<{
      assignments: Array<{ lessonTitle: string; title: string; description: string }>;
    }>(assignmentsResponse);

    for (const assignment of assignmentsData.assignments) {
      const lesson = await prisma.lesson.findFirst({
        where: { module: { courseId: course.id }, title: assignment.lessonTitle }
      });
      if (!lesson) continue;
      await prisma.assignment.create({
        data: {
          lessonId: lesson.id,
          title: assignment.title,
          description: assignment.description
        }
      });
    }
  }

  if (input.finalProject) {
    reportProgress(options, "project", enabledSteps);
    const projectPromptText = projectPrompt(input);
    const projectResponse = await runAIStep(input.userId, course.id, "PROJECT", projectPromptText, () =>
      complete(projectPromptText)
    );
    const projectData = parseJson<{ title: string; description: string }>(projectResponse);

    await prisma.course.update({
      where: { id: course.id },
      data: {
        description: `${course.description}\n\nFinal Project: ${projectData.title}\n${projectData.description}`
      }
    });
  }

  if (input.certificate) {
    reportProgress(options, "certificate", enabledSteps);
    const certificatePromptText = certificatePrompt(input);
    const certificateResponse = await runAIStep(input.userId, course.id, "CERTIFICATE", certificatePromptText, () =>
      complete(certificatePromptText)
    );
    const certificateData = parseJson<{ content: string }>(certificateResponse);

    await prisma.certificate.create({
      data: {
        courseId: course.id,
        content: certificateData.content
      }
    });
  }

  await incrementUsage(input.userId, "COURSE");

  reportProgress(options, "complete", enabledSteps);
  return { courseId: course.id };
}
