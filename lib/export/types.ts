export type ExportFormat = "pdf" | "docx" | "markdown" | "html" | "json" | "csv" | "pptx";

export interface ExportPayload {
  id: string;
  title: string;
  description: string;
  topic: string;
  audience: string;
  difficulty: string;
  language: string;
  tone: string;
  lessonCount: number;
  duration: string;
  status: string;
  modules: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      examples?: string | null;
      exercises?: string | null;
    }>;
  }>;
  quizzes?: Array<{ lessonTitle: string; question: string; answer: string; options: string[] }>;
  assignments?: Array<{ lessonTitle: string; title: string; description: string }>;
  certificateContent?: string | null;
}

export interface ExportResult {
  contentType: string;
  filename: string;
  buffer: Buffer;
}
