import PptxGenJS from "pptxgenjs";
import { ExportService } from "./base";
import type { ExportPayload, ExportResult } from "../types";

export class PptxExportService extends ExportService {
  readonly format = "pptx" as const;

  async generate(payload: ExportPayload): Promise<ExportResult> {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    slide.addText(payload.title, { x: 0.5, y: 0.5, w: 10, h: 1, fontSize: 24, bold: true });
    slide.addText(payload.description, { x: 0.5, y: 1.4, w: 10, h: 1.5, fontSize: 14 });

    payload.modules.forEach((module, index) => {
      slide.addText(`${index + 1}. ${module.title}`, { x: 0.7, y: 2.5 + index * 0.8, w: 9, h: 0.5, fontSize: 16, bold: true });
    });

    const buffer = await pptx.write();
    const output = buffer instanceof ArrayBuffer
      ? Buffer.from(buffer)
      : buffer instanceof Uint8Array
        ? Buffer.from(buffer)
        : Buffer.from(String(buffer));

    return {
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      filename: this.buildFilename(payload, "pptx"),
      buffer: output
    };
  }
}
