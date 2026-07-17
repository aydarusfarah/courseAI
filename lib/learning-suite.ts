import { prisma } from "./prisma";
import { complete } from "./ai";
import { incrementUsage } from "./billing";
import { z } from "zod";


export const learningAssetTypes = [
  "quiz",
  "flashcards",
  "assignments",
  "homework",
  "coding-exercises",
  "case-studies",
  "cheat-sheets",
  "learning-objectives",
  "lesson-summaries",
  "practice-exams",
  "final-exams",
  "final-projects",
  "study-guides",
  "interview-questions",
  "mind-maps",
  "glossary",
  "key-takeaways"
] as const;

export type LearningAssetType = (typeof learningAssetTypes)[number];

export interface AssetGenerationRequest {
  courseId: string;
  userId: string;
  lessonId?: string | null;
  type: LearningAssetType;
  prompt: string;
  mode?: "generate" | "regenerate" | "improve" | "expand" | "shorten" | "simplify" | "translate" | "rewrite";
}

const assetSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
});

export async function generateLearningAsset(payload: AssetGenerationRequest) {
  const prompt = `${payload.prompt}\n\nReturn valid JSON with {"title": "...", "content": "..."}.`;
  const response = await complete(prompt);

  let rawParsed: unknown;
  try {
    rawParsed = JSON.parse(response);
  } catch {
    throw new Error("AI returned a response that could not be parsed as JSON.");
  }

  const parsed = assetSchema.safeParse(rawParsed);

  if (!parsed.success) {
    throw new Error("AI response did not match the expected asset format.");
  }

  const saved = await prisma.learningAsset.create({
    data: {
      userId: payload.userId,
      courseId: payload.courseId,
      lessonId: payload.lessonId ?? null,
      assetType: payload.type,
      title: parsed.data.title,
      content: parsed.data.content,
      promptVersion: "v1",
      mode: payload.mode ?? "generate"
    }
  });

  await prisma.aIRequest.create({
    data: {
      userId: payload.userId,
      courseId: payload.courseId,
      lessonId: payload.lessonId ?? null,
      action: "ASSET",
      assetType: payload.type,
      prompt,
      response: parsed.data.content,
      tokens: 0,
      status: "COMPLETED"
    }
  });

  await incrementUsage(payload.userId, "AI_REQUEST");

  return saved;
}

export async function generateAssistantReply(payload: { courseId: string; userId: string; lessonId?: string | null; message: string }) {
  const context = await prisma.learningAsset.findMany({
    where: { courseId: payload.courseId, userId: payload.userId },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  const prompt = `You are a course assistant. Use the course context below to answer the user's request.\n\nCourse context:\n${context.map((asset) => `${asset.assetType}: ${asset.title}\n${asset.content}`).join("\n\n")}\n\nUser request: ${payload.message}`;

  const response = await complete(prompt);

  await prisma.aIRequest.create({
    data: {
      userId: payload.userId,
      courseId: payload.courseId,
      lessonId: payload.lessonId ?? null,
      action: "ASSISTANT",
      prompt,
      response,
      tokens: 0,
      status: "COMPLETED"
    }
  });

  return response;
}

export async function listLearningAssets(courseId: string, userId: string) {
  return prisma.learningAsset.findMany({
    where: { courseId, userId },
    orderBy: { createdAt: "desc" }
  });
}
