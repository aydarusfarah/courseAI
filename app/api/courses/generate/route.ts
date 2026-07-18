import { NextRequest } from "next/server";
import { ensurePrismaUser, AuthError } from "../../../../lib/auth";
import { generateCourse, type GenerationStep } from "../../../../lib/generation";
import { generatorFormSchema, mapFormToGenerationInput } from "../../../../lib/validation/generation";
import { toAIError } from "../../../../lib/ai";

const stepLabels: Record<GenerationStep, string> = {
  outline: "Generating course outline",
  lessons: "Writing lesson content",
  quizzes: "Creating quiz questions",
  flashcards: "Building flashcards",
  assignments: "Designing assignments",
  project: "Preparing final project",
  certificate: "Generating certificate",
  complete: "Finishing up"
};

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      try {
        const user = await ensurePrismaUser();
        const body = await request.json();
        const parseResult = generatorFormSchema.safeParse(body);

        if (!parseResult.success) {
          send({ type: "error", message: "Invalid request", details: parseResult.error.format() });
          controller.close();
          return;
        }

        const input = mapFormToGenerationInput(parseResult.data);

        send({ type: "progress", step: "outline", percent: 5, label: stepLabels.outline });

        const result = await generateCourse(
          { ...input, userId: user.id },
          {
            onProgress: (step, percent) => {
              send({
                type: "progress",
                step,
                percent,
                label: stepLabels[step]
              });
            }
          }
        );

        send({ type: "complete", courseId: result.courseId, percent: 100 });
        controller.close();
      } catch (error) {
        if (error instanceof AuthError) {
          send({ type: "error", message: "You must be signed in to generate a course." });
        } else {
          const aiErr = toAIError(error);
          send({ type: "error", message: aiErr.message, code: aiErr.code });
        }
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache"
    }
  });
}
