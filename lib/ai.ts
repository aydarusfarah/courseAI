import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

/** User-facing messages for known OpenAI error conditions */
export class AIError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "quota_exceeded"
      | "invalid_key"
      | "model_unavailable"
      | "timeout"
      | "rate_limited"
      | "unknown"
  ) {
    super(message);
    this.name = "AIError";
  }
}

/**
 * Translates a raw OpenAI SDK error into a user-friendly AIError.
 * Logs the raw error server-side so the original detail is never lost.
 */
export function toAIError(err: unknown): AIError {
  console.error("[ai] OpenAI error:", err);

  if (err instanceof OpenAI.APIError) {
    const status = err.status;
    const msg    = err.message ?? "";

    if (status === 401 || msg.includes("Incorrect API key")) {
      return new AIError("AI service is misconfigured. Please contact support.", "invalid_key");
    }
    if (status === 429) {
      if (msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("billing")) {
        return new AIError(
          "AI generation limit reached. Please upgrade your plan or try again later.",
          "quota_exceeded"
        );
      }
      return new AIError("Too many requests. Please wait a moment and try again.", "rate_limited");
    }
    if (status === 503 || msg.toLowerCase().includes("overloaded")) {
      return new AIError("The AI model is temporarily unavailable. Please try again shortly.", "model_unavailable");
    }
    if (status === 404 && msg.toLowerCase().includes("model")) {
      return new AIError("The requested AI model is not available. Please contact support.", "model_unavailable");
    }
  }

  if (err instanceof Error && (err.message.includes("timeout") || err.message.includes("ETIMEDOUT"))) {
    return new AIError("AI generation timed out. Please try again with a shorter topic.", "timeout");
  }

  return new AIError("Course generation failed. Please try again.", "unknown");
}

export interface AIResponseChunk {
  text: string;
  done: boolean;
}

export async function streamCompletion(
  prompt: string,
  model = "gpt-4.1",
  temperature = 0.8
): Promise<ReadableStream<AIResponseChunk>> {
  const response = await getClient().responses.create({
    model,
    input: prompt,
    temperature,
    max_output_tokens: 1200
  });

  const text = response.output_text ?? "";

  return new ReadableStream<AIResponseChunk>({
    start(controller) {
      controller.enqueue({ text, done: false });
      controller.enqueue({ text: "", done: true });
      controller.close();
    }
  });
}

export async function complete(prompt: string, model = "gpt-4.1", temperature = 0.8) {
  const response = await getClient().responses.create({
    model,
    input: prompt,
    temperature,
    max_output_tokens: 1200
  });

  return response.output_text;
}
