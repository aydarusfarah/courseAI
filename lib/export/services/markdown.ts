import { ExportService } from "./base";
import type { ExportPayload, ExportResult } from "../types";

export class MarkdownExportService extends ExportService {
  readonly format = "markdown" as const;

  async generate(payload: ExportPayload): Promise<ExportResult> {
    const sections = [
      `# ${payload.title}`,
      "",
      payload.description,
      "",
      "## Learning Objectives",
      "",
      `- Audience: ${payload.audience}`,
      `- Difficulty: ${payload.difficulty}`,
      `- Language: ${payload.language}`,
      "",
      "## Modules",
      ""
    ];

    for (const module of payload.modules) {
      sections.push(`### ${module.title}`);
      sections.push("");
      for (const lesson of module.lessons) {
        sections.push(`- **${lesson.title}**: ${lesson.content.replace(/<[^>]+>/g, "").slice(0, 180)}`);
      }
      sections.push("");
    }

    if (payload.quizzes?.length) {
      sections.push("## Quizzes", "");
      for (const quiz of payload.quizzes) {
        sections.push(`- ${quiz.lessonTitle}: ${quiz.question}`);
      }
      sections.push("");
    }

    if (payload.assignments?.length) {
      sections.push("## Assignments", "");
      for (const assignment of payload.assignments) {
        sections.push(`- ${assignment.title}: ${assignment.description}`);
      }
      sections.push("");
    }

    if (payload.certificateContent) {
      sections.push("## Certificate Appendix", "", payload.certificateContent);
    }

    const content = sections.join("\n");
    return {
      contentType: "text/markdown; charset=utf-8",
      filename: this.buildFilename(payload, "md"),
      buffer: Buffer.from(content, "utf8")
    };
  }
}
