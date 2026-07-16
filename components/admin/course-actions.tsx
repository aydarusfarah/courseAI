"use client";

import { useState } from "react";
import { Button } from "../button";
import { Badge } from "../ui/badge";
import { Dialog } from "../ui/dialog";

interface Props {
  courseId: string;
  archivedAt?: string | Date | null;
}

export default function CourseActions({ courseId, archivedAt }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isArchived, setIsArchived] = useState(Boolean(archivedAt));
  const [featured, setFeatured] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = async (action: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Action failed");

      if (action === "archive") setIsArchived(true);
      if (action === "restore") setIsArchived(false);
      if (action === "feature") setFeatured((f) => !f);
      setMessage(action === "duplicate" ? "Duplicated!" : "Done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {featured && <Badge variant="warning">Featured</Badge>}

        {isArchived ? (
          <Button variant="default" onClick={() => run("restore")} disabled={loading} className="text-xs py-1.5 px-3">Restore</Button>
        ) : (
          <Button variant="outline" onClick={() => run("archive")} disabled={loading} className="text-xs py-1.5 px-3">Archive</Button>
        )}

        <Button variant="secondary" onClick={() => run("duplicate")} disabled={loading} className="text-xs py-1.5 px-3">Duplicate</Button>

        <Button
          variant="ghost"
          onClick={() => run("feature")}
          disabled={loading}
          className="text-xs py-1.5 px-3"
        >
          {featured ? "Unfeature" : "Feature"}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setConfirmDelete(true)}
          disabled={loading}
          className="text-xs py-1.5 px-3 text-rose-600 hover:bg-rose-50"
        >
          Delete
        </Button>

        {message ? <p className="w-full text-xs text-slate-500">{message}</p> : null}
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-950">Delete course?</h3>
          <p className="text-sm text-slate-600">This will soft-delete the course. It won&#39;t be visible to the user but data is retained.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button onClick={() => run("delete")} disabled={loading}>{loading ? "Deleting..." : "Confirm Delete"}</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
