"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../button";
import { Toast } from "../ui/toast";

interface CourseSummary {
  id: string;
  title?: string;
  archivedAt?: Date | null;
}

interface CourseActionButtonsProps {
  course: CourseSummary;
  compact?: boolean;
}

export function CourseActionButtons({ course, compact = false }: CourseActionButtonsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const isArchived = Boolean(course.archivedAt);

  async function performAction(action: "archive" | "restore" | "delete") {
    setBusy(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, courseId: course.id })
      });

      if (!response.ok) {
        throw new Error("The course action could not be completed.");
      }

      if (action === "delete") {
        router.push("/courses");
      } else {
        router.refresh();
      }

      setToast(action === "archive" ? "Course archived" : action === "restore" ? "Course restored" : "Course deleted");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"}`}>
        {!isArchived ? (
          <Button type="button" variant="secondary" onClick={() => void performAction("archive")} disabled={busy} className={compact ? "px-3 py-2 text-xs" : undefined}>
            {compact ? "Archive" : "Archive"}
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={() => void performAction("restore")} disabled={busy} className={compact ? "px-3 py-2 text-xs" : undefined}>
            {compact ? "Restore" : "Restore"}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => void performAction("delete")} disabled={busy} className={compact ? "px-3 py-2 text-xs" : undefined}>
          Delete
        </Button>
      </div>
      <Toast open={Boolean(toast)} message={toast ?? ""} variant="success" onOpenChange={() => setToast(null)} />
    </>
  );
}

export function CreateCourseButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleCreate() {
    setBusy(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", payload: { title: "New Course" } })
      });

      const data = await response.json();
      if (!response.ok || !data.course?.id) {
        throw new Error("The course could not be created.");
      }

      router.push(`/courses/${data.course.id}`);
      setToast("Course created");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Creation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => void handleCreate()} disabled={busy} className={className}>
        {busy ? "Creating..." : "Create course"}
      </Button>
      <Toast open={Boolean(toast)} message={toast ?? ""} variant="success" onOpenChange={() => setToast(null)} />
    </>
  );
}
