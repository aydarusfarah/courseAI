import { ExportService } from "./base";
import type { ExportPayload, ExportResult } from "../types";

export class HtmlExportService extends ExportService {
  readonly format = "html" as const;

  async generate(payload: ExportPayload): Promise<ExportResult> {
    const moduleHtml = payload.modules
      .map((module) => {
        const lessons = module.lessons
          .map((lesson) => `<li><strong>${lesson.title}</strong>: ${lesson.content.replace(/<[^>]+>/g, "")}</li>`)
          .join("");
        return `<section><h2>${module.title}</h2><ul>${lessons}</ul></section>`;
      })
      .join("");

    const content = `<!doctype html><html><head><meta charset="utf-8" /><title>${payload.title}</title></head><body><h1>${payload.title}</h1><p>${payload.description}</p>${moduleHtml}</body></html>`;

    return {
      contentType: "text/html; charset=utf-8",
      filename: this.buildFilename(payload, "html"),
      buffer: Buffer.from(content, "utf8")
    };
  }
}
