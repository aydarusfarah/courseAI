"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
import { Toast } from "../ui/toast";
import { RichEditor } from "../editor/rich-editor";
import { Skeleton } from "../ui/skeleton";
import { Dialog } from "../ui/dialog";

interface LessonData {
  id: string;
  title: string;
  content: string;
  examples?: string;
  exercises?: string;
  [key: string]: string | undefined;
}

interface ModuleWithLessons {
  id: string;
  title: string;
  lessons: LessonData[];
}

interface CourseData {
  title?: string;
  description?: string;
  topic?: string;
  audience?: string;
  difficulty?: string;
  language?: string;
  tone?: string;
  status?: string;
  modules?: ModuleWithLessons[];
}

interface CourseEditorProps {
  courseId: string;
}

export function CourseEditor({ courseId }: CourseEditorProps) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"delete-module" | "delete-lesson" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lessonSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({}); 

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch(`/api/courses/${courseId}/edit`);
      const data = await response.json();
      if (active) {
        setCourse(data.course);
        setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (!dirty || !course) return;
    const timer = setTimeout(() => {
      void saveCourse();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, dirty]);

  async function saveCourse() {
    if (!course) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", payload: { title: course.title, description: course.description, topic: course.topic, audience: course.audience, difficulty: course.difficulty, language: course.language, tone: course.tone, status: course.status } })
      });
      if (!response.ok) throw new Error("Could not save course.");
      setDirty(false);
      setToast("Course saved");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const updateField = (field: string, value: string) => {
    setCourse((current: CourseData | null) => current ? ({ ...current, [field]: value }) : null);
    setDirty(true);
  };

  async function saveModuleTitle(moduleId: string, title: string) {
    const response = await fetch(`/api/courses/${courseId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-module", moduleId, title })
    });
    if (!response.ok) {
      setToast("Failed to save module title");
    }
  }

  const updateLessonField = (moduleId: string, lessonId: string, field: string, value: string) => {
    setCourse((current: CourseData | null) => current ? ({
      ...current,
      modules: current.modules?.map((module: ModuleWithLessons) => (module.id === moduleId ? { ...module, lessons: module.lessons.map((lesson: LessonData) => (lesson.id === lessonId ? { ...lesson, [field]: value } : lesson)) } : module))
    }) : null);
    setDirty(true);

    // Debounced per-lesson save
    if (lessonSaveTimers.current[lessonId]) {
      clearTimeout(lessonSaveTimers.current[lessonId]);
    }
    lessonSaveTimers.current[lessonId] = setTimeout(async () => {
      try {
        const snapshot = await new Promise<CourseData | null>((resolve) => {
          setCourse((current: CourseData | null) => { resolve(current); return current; });
        });
        const lesson = snapshot?.modules
          ?.flatMap((m: ModuleWithLessons) => m.lessons)
          ?.find((l: LessonData) => l.id === lessonId);
        if (!lesson) return;
        await fetch(`/api/courses/${courseId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update-lesson",
            moduleId,
            lessonId,
            payload: { title: lesson.title, content: lesson.content, examples: lesson.examples, exercises: lesson.exercises }
          })
        });
      } catch {
        // silent fail – user will see next full save error if any
      }
    }, 800);
  };

  async function createModule() {
    const response = await fetch(`/api/courses/${courseId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-module", title: "New Module" })
    });
    if (response.ok) {
      setToast("Module created");
      window.location.reload();
    }
  }

  async function createLesson(moduleId: string) {
    const response = await fetch(`/api/courses/${courseId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-lesson", moduleId, title: "New Lesson" })
    });
    if (response.ok) {
      setToast("Lesson created");
      window.location.reload();
    }
  }

  async function confirmAction() {
    if (!pendingAction || !selectedId) return;
    if (pendingAction === "delete-lesson") {
      const response = await fetch(`/api/courses/${courseId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-lesson", lessonId: selectedId })
      });
      if (response.ok) window.location.reload();
    }
    setConfirmOpen(false);
  }

  const statusLabel = useMemo(() => {
    if (saving) return "Saving…";
    if (dirty) return "Unsaved changes";
    return "All changes saved";
  }, [dirty, saving]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!course) return null;

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Editor status</p>
            <p className="text-sm text-slate-700">{statusLabel}</p>
          </div>
          <Button type="button" variant="secondary" onClick={createModule}>Add Module</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Course title</label>
            <Input value={course.title ?? ""} onChange={(event) => updateField("title", event.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Topic</label>
            <Input value={course.topic ?? ""} onChange={(event) => updateField("topic", event.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Audience</label>
            <Input value={course.audience ?? ""} onChange={(event) => updateField("audience", event.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={course.status ?? "DRAFT"} onChange={(event) => updateField("status", event.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Course description</label>
          <Textarea value={course.description ?? ""} onChange={(event) => updateField("description", event.target.value)} />
        </div>
      </Card>

      <div className="space-y-4">
        {(course.modules ?? []).map((module: ModuleWithLessons) => (
          <Card key={module.id} className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Input
                value={module.title}
                onChange={(event) => {
                  const value = event.target.value;
                  setCourse((current: CourseData | null) => current ? ({
                    ...current,
                    modules: current.modules?.map((item: ModuleWithLessons) =>
                      item.id === module.id ? { ...item, title: value } : item
                    )
                  }) : null);
                }}
                onBlur={(event) => {
                  void saveModuleTitle(module.id, event.target.value);
                }}
              />
              <Button type="button" variant="secondary" onClick={() => createLesson(module.id)}>Add Lesson</Button>
            </div>
            <div className="space-y-3">
              {(module.lessons ?? []).map((lesson: LessonData) => (
                <div key={lesson.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <input className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" value={lesson.title} onChange={(event) => updateLessonField(module.id, lesson.id, "title", event.target.value)} />
                    <Button type="button" variant="ghost" onClick={() => { setPendingAction("delete-lesson"); setSelectedId(lesson.id); setConfirmOpen(true); }}>
                      Delete
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <RichEditor value={lesson.content ?? ""} onChange={(value) => updateLessonField(module.id, lesson.id, "content", value)} placeholder="Write lesson content..." />
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Examples</label>
                      <Textarea value={lesson.examples ?? ""} onChange={(event) => updateLessonField(module.id, lesson.id, "examples", event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Exercises</label>
                      <Textarea value={lesson.exercises ?? ""} onChange={(event) => updateLessonField(module.id, lesson.id, "exercises", event.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-950">Confirm deletion</h3>
          <p className="text-sm text-slate-600">This will remove the selected lesson. Continue?</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button type="button" onClick={confirmAction}>Confirm</Button>
          </div>
        </div>
      </Dialog>

      <Toast open={Boolean(toast)} message={toast ?? ""} variant="success" onOpenChange={() => setToast(null)} />
    </div>
  );
}
