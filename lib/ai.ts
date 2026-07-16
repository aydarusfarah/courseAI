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
