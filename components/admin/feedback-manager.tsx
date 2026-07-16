"use client";

import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Badge } from "../ui/badge";
import { Dialog } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Select } from "../ui/select";
import { Toast } from "../ui/toast";

interface Feedback {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  resolved: boolean;
  response: string | null;
  createdAt: Date | string;
}

interface Props {
  initialFeedback: Feedback[];
  total: number;
  page: number;
  perPage: number;
  currentStatus: string;
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger"> = {
  open: "warning",
  resolved: "success",
  archived: "default"
};

export default function FeedbackManager({ initialFeedback, total, page, perPage, currentStatus }: Props) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "danger" } | null>(null);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      return json;
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selected) return;
    try {
      const json = await patch(selected.id, {
        status: "resolved",
        response: responseText,
        resolved: true
      });
      setFeedback((prev) => prev.map((f) => (f.id === selected.id ? { ...f, ...json.feedback } : f)));
      setSelected(null);
      setResponseText("");
      setToast({ message: "Response sent & marked resolved.", variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", variant: "danger" });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await patch(id, { action: "archive" });
      setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, status: "archived" } : f)));
      setToast({ message: "Archived.", variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", variant: "danger" });
    }
  };

  const handleReopen = async (id: string) => {
    try {
      const json = await patch(id, { status: "open", resolved: false });
      setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, ...json.feedback } : f)));
      setToast({ message: "Reopened.", variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", variant: "danger" });
    }
  };

  const filtered = feedback.filter(
    (f) => statusFilter === "all" || f.status === statusFilter
  );

  return (
    <>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </Select>
          <p className="text-sm text-slate-500">{total} total · page {page} of {Math.ceil(total / perPage)}</p>
        </div>

        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No feedback items found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div key={item.id} className="space-y-2 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <Badge variant={statusColors[item.status] ?? "default"}>{item.status}</Badge>
                      <Badge variant="default">{item.type}</Badge>
                      {item.resolved && <Badge variant="success">Resolved</Badge>}
                    </div>
                    <p className="text-sm text-slate-600">{item.content}</p>
                    {item.response && (
                      <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold text-emerald-700">Admin response:</p>
                        <p className="mt-1 text-sm text-slate-700">{item.response}</p>
                      </div>
                    )}
                    <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status !== "archived" && (
                      <>
                        {item.status !== "resolved" && (
                          <Button
                            variant="outline"
                            onClick={() => { setSelected(item); setResponseText(item.response ?? ""); }}
                            className="text-xs py-1.5 px-3"
                          >
                            Respond
                          </Button>
                        )}
                        {item.status === "resolved" && (
                          <Button variant="ghost" onClick={() => handleReopen(item.id)} className="text-xs py-1.5 px-3">Reopen</Button>
                        )}
                        <Button variant="ghost" onClick={() => handleArchive(item.id)} disabled={loading} className="text-xs py-1.5 px-3">Archive</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`?status=${statusFilter}&page=${page - 1}`} className="rounded-md border px-3 py-1 text-sm">Prev</a>
            )}
            {page * perPage < total && (
              <a href={`?status=${statusFilter}&page=${page + 1}`} className="rounded-md border px-3 py-1 text-sm">Next</a>
            )}
          </div>
        </div>
      </Card>

      {/* Respond dialog */}
      {selected && (
        <Dialog open={Boolean(selected)} onOpenChange={() => { setSelected(null); setResponseText(""); }}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-950">Respond to feedback</h3>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{selected.title}</p>
              <p className="mt-1 text-sm text-slate-600">{selected.content}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Your response</label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setSelected(null); setResponseText(""); }}>Cancel</Button>
              <Button onClick={handleRespond} disabled={loading || !responseText}>
                {loading ? "Sending..." : "Send & Mark Resolved"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {toast && (
        <Toast open message={toast.message} variant={toast.variant} onOpenChange={() => setToast(null)} />
      )}
    </>
  );
}
