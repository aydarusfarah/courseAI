import { z } from "zod";
import type { CourseGenerationInput } from "../prompts";
import type { Difficulty } from "@prisma/client";

export const generatorFormSchema = z.object({
  title: z.string().min(5, "Course title is required"),
  topic: z.string().min(3, "Topic is required"),
  description: z.string().min(10, "Description is required"),
  audience: z.string().min(3, "Audience is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  language: z.string().min(2, "Language is required"),
  teachingStyle: z.enum(["Lecture", "Hands-on", "Project-based", "Discussion"]),
  tone: z.enum(["Professional", "Friendly", "Inspirational", "Concise"]),
  modules: z.number().min(1).max(20),
  lessonsPerModule: z.number().min(1).max(20),
  duration: z.enum(["2 weeks", "4 weeks", "8 weeks", "12 weeks"]),
  exercises: z.boolean(),
  quizzes: z.boolean(),
  flashcards: z.boolean(),
  assignments: z.boolean(),
  finalProject: z.boolean(),
  certificate: z.boolean(),
  creativity: z.enum(["Low", "Medium", "High"]),
  detailLevel: z.enum(["Concise", "Balanced", "Thorough"]),
  outputLength: z.enum(["Short", "Medium", "Long"]),
  readingLevel: z.enum(["Middle school", "High school", "College"]),
  generateSlides: z.boolean(),
  generatePdf: z.boolean()
});

export type GeneratorFormValues = z.infer<typeof generatorFormSchema>;

const difficultyMap: Record<GeneratorFormValues["difficulty"], Difficulty> = {
  Beginner: "BEGINNER",
  Intermediate: "INTERMEDIATE",
  Advanced: "ADVANCED"
};

export function mapFormToGenerationInput(form: GeneratorFormValues): CourseGenerationInput {
  return {
    title: form.title,
    topic: form.topic,
    description: form.description,
    audience: form.audience,
    difficulty: difficultyMap[form.difficulty],
    language: form.language,
    teachingStyle: form.teachingStyle,
    tone: form.tone,
    modules: form.modules,
    lessonsPerModule: form.lessonsPerModule,
    duration: form.duration,
    exercises: form.exercises,
    quizzes: form.quizzes,
    flashcards: form.flashcards,
    assignments: form.assignments,
    finalProject: form.finalProject,
    certificate: form.certificate,
    creativity: form.creativity,
    detailLevel: form.detailLevel,
    outputLength: form.outputLength,
    readingLevel: form.readingLevel
  };
}
