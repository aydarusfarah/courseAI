import { ExportService } from "./base";
import type { ExportPayload, ExportResult } from "../types";

export class CsvExportService extends ExportService {
  readonly format = "csv" as const;

  async generate(payload: ExportPayload): Promise<ExportResult> {
    const rows = payload.modules.flatMap((module) =>
      module.lessons.map((lesson) => `${module.title},${lesson.title},"${lesson.content.replace(/\s+/g, " ").slice(0, 160)}"`)
    );

    const content = ["module,title,content", ...rows].join("\n");

    return {
      contentType: "text/csv; charset=utf-8",
      filename: this.buildFilename(payload, "csv"),
      buffer: Buffer.from(content, "utf8")
    };
  }
}
