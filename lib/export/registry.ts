import { CsvExportService } from "./services/csv";
import { DocxExportService } from "./services/docx";
import { HtmlExportService } from "./services/html";
import { JsonExportService } from "./services/json";
import { MarkdownExportService } from "./services/markdown";
import { PdfExportService } from "./services/pdf";
import { PptxExportService } from "./services/pptx";
import type { ExportFormat, ExportPayload, ExportResult } from "./types";

const services = {
  pdf: new PdfExportService(),
  docx: new DocxExportService(),
  markdown: new MarkdownExportService(),
  html: new HtmlExportService(),
  json: new JsonExportService(),
  csv: new CsvExportService(),
  pptx: new PptxExportService()
} satisfies Record<ExportFormat, { generate(payload: ExportPayload): Promise<ExportResult> }>;

export async function exportCourse(payload: ExportPayload, format: ExportFormat): Promise<ExportResult> {
  const service = services[format];
  if (!service) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  return service.generate(payload);
}
