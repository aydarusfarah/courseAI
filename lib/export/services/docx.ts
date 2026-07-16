import { Document, Packer, Paragraph, TextRun } from "docx";
import { ExportService } from "./base";
import type { ExportPayload, ExportResult } from "../types";

export class DocxExportService extends ExportService {
  readonly format = "docx" as const;

  async generate(payload: ExportPayload): Promise<ExportResult> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ children: [new TextRun({ text: payload.title, bold: true, size: 28 })] }),
            new Paragraph({ children: [new TextRun({ text: payload.description })] }),
            new Paragraph({ children: [new TextRun({ text: `Audience: ${payload.audience}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Difficulty: ${payload.difficulty}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Language: ${payload.language}` })] })
          ]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    return {
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      filename: this.buildFilename(payload, "docx"),
      buffer
    };
  }
}
