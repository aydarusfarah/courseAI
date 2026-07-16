import { ExportService } from "./base";
import type { ExportPayload, ExportResult } from "../types";

export class JsonExportService extends ExportService {
  readonly format = "json" as const;

  async generate(payload: ExportPayload): Promise<ExportResult> {
    return {
      contentType: "application/json; charset=utf-8",
      filename: this.buildFilename(payload, "json"),
      buffer: Buffer.from(JSON.stringify(payload, null, 2), "utf8")
    };
  }
}
