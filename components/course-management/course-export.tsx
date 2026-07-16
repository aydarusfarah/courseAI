"use client";

import { useState } from "react";
import { Button } from "../../components/button";
import { Select } from "../../components/ui/select";
import type { ExportFormat } from "../../lib/export/types";

interface CourseExportActionsProps {
  courseId: string;
}

export function CourseExportActions({ courseId }: CourseExportActionsProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/courses/${courseId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format })
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.headers.get("x-export-filename") ?? `${courseId}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      setMessage("Export ready for download.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <Select value={format} onChange={(event) => setFormat(event.target.value as ExportFormat)} className="w-40">
        <option value="pdf">PDF</option>
        <option value="docx">DOCX</option>
        <option value="markdown">Markdown</option>
        <option value="html">HTML</option>
        <option value="json">JSON</option>
        <option value="csv">CSV</option>
        <option value="pptx">PPTX</option>
      </Select>
      <Button variant="outline" onClick={handleExport} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export"}
      </Button>
      {message ? <span className="text-sm text-slate-600">{message}</span> : null}
    </div>
  );
}
