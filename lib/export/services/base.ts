import type { ExportFormat, ExportPayload, ExportResult } from "../types";

export abstract class ExportService {
  abstract readonly format: ExportFormat;
  abstract generate(payload: ExportPayload): Promise<ExportResult>;

  protected buildFilename(payload: ExportPayload, ext: string) {
    return `${payload.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "course"}.${ext}`;
  }
}
