import PDFDocument from "pdfkit";
import { ExportService } from "./base";
import type { ExportPayload, ExportResult } from "../types";

export class PdfExportService extends ExportService {
  readonly format = "pdf" as const;

  async generate(payload: ExportPayload): Promise<ExportResult> {
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    doc.on("end", () => {
      // handled via Promise below
    });

    doc.fontSize(20).text(payload.title, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(payload.description, { align: "left" });
    doc.moveDown();
    doc.fontSize(12).text(`Audience: ${payload.audience}`);
    doc.text(`Difficulty: ${payload.difficulty}`);
    doc.text(`Language: ${payload.language}`);
    doc.moveDown();

    for (const module of payload.modules) {
      doc.fontSize(14).text(module.title, { underline: true });
      for (const lesson of module.lessons) {
        doc.fontSize(11).text(`• ${lesson.title}`);
      }
      doc.moveDown();
    }

    doc.end();

    return new Promise<ExportResult>((resolve, reject) => {
      doc.on("end", () => {
        resolve({
          contentType: "application/pdf",
          filename: this.buildFilename(payload, "pdf"),
          buffer: Buffer.concat(chunks)
        });
      });
      doc.on("error", reject);
    });
  }
}
