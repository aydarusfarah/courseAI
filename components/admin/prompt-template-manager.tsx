"use client";

import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
import { Badge } from "../ui/badge";
import { Dialog } from "../ui/dialog";
import { Toast } from "../ui/toast";

type TemplateType =
  | "OUTLINE"
  | "LESSON"
  | "QUIZ"
  | "ASSIGNMENT"
  | "SLIDES"
  | "CERTIFICATE"
  | "SEO"
  | "MARKETING"
  | "EMAIL"
  | "LANDING_PAGE";

interface Template {
  id: string;
  name: string;
  description: string | null;
  type: TemplateType;
  prompt: string;
  deletedAt: Date | string | null;
  updatedAt: Date | string;
}

interface Props {
  initialTemplates: Template[];
  adminId: string;
}

const TYPES: TemplateType[] = [
  "OUTLINE", "LESSON", "QUIZ", "ASSIGNMENT", "SLIDES",
  "CERTIFICATE", "SEO", "MARKETING", "EMAIL", "LANDING_PAGE"
];

const emptyForm = { name: "", description: "", type: "LESSON" as TemplateType, prompt: "" };

export default function PromptTemplateManager({ initialTemplates, adminId: _adminId }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "danger" } | null>(null);

  const filtered = templates.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" ? !t.deletedAt : Boolean(t.deletedAt));
    return matchesSearch && matchesStatus;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ name: t.name, description: t.description ?? "", type: t.type, prompt: t.prompt });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.prompt) return;
    setLoading(true);
    try {
      let res: Response;
      if (editing) {
        res = await fetch(`/api/admin/prompt-templates/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      } else {
        res = await fetch("/api/admin/prompt-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      const updated: Template = json.template;
      setTemplates((prev) =>
        editing
          ? prev.map((t) => (t.id === updated.id ? updated : t))
          : [updated, ...prev]
      );
      setDialogOpen(false);
      setToast({ message: editing ? "Template updated." : "Template created.", variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (id: string, action: "enable" | "disable" | "duplicate" | "delete") => {
    setLoading(true);
    try {
      let res: Response;
      if (action === "delete") {
        res = await fetch(`/api/admin/prompt-templates/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error((await res.json())?.error ?? "Failed");
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      } else {
        res = await fetch(`/api/admin/prompt-templates/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed");
        const updated: Template = json.template;
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
      setToast({ message: "Done", variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap gap-3">
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs border border-slate-200 bg-white px-4"
            />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="all">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </Select>
          </div>
          <Button onClick={openCreate}>+ New Template</Button>
        </div>

        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No templates found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((t) => (
              <div key={t.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{t.name}</p>
                    <Badge variant="default">{t.type}</Badge>
                    {t.deletedAt ? (
                      <Badge variant="warning">Disabled</Badge>
                    ) : (
                      <Badge variant="success">Enabled</Badge>
                    )}
                  </div>
                  {t.description && <p className="text-sm text-slate-600">{t.description}</p>}
                  <p className="truncate text-xs text-slate-400">{t.prompt.slice(0, 120)}…</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => openEdit(t)} className="text-xs py-1.5 px-3">Edit</Button>
                  {t.deletedAt ? (
                    <Button variant="secondary" onClick={() => runAction(t.id, "enable")} disabled={loading} className="text-xs py-1.5 px-3">Enable</Button>
                  ) : (
                    <Button variant="ghost" onClick={() => runAction(t.id, "disable")} disabled={loading} className="text-xs py-1.5 px-3">Disable</Button>
                  )}
                  <Button variant="ghost" onClick={() => runAction(t.id, "duplicate")} disabled={loading} className="text-xs py-1.5 px-3">Duplicate</Button>
                  <Button variant="ghost" onClick={() => runAction(t.id, "delete")} disabled={loading} className="text-xs py-1.5 px-3 text-rose-600 hover:bg-rose-50">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-950">{editing ? "Edit Template" : "New Template"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Template name" className="border border-slate-200 bg-white px-4" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Type</label>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TemplateType }))}>
                {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" className="border border-slate-200 bg-white px-4" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Prompt</label>
            <Textarea
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              placeholder="Enter the prompt text..."
              className="min-h-[160px]"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !form.name || !form.prompt}>
              {loading ? "Saving..." : editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      {toast && (
        <Toast open message={toast.message} variant={toast.variant} onOpenChange={() => setToast(null)} />
      )}
    </>
  );
}
