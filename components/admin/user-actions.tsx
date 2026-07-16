"use client";

import { useState } from "react";
import { Button } from "../button";
import { Dialog } from "../ui/dialog";

interface AdminUserActionsProps {
  userId: string;
  suspended: boolean;
  role: string;
}

export default function AdminUserActions({ userId, suspended, role }: AdminUserActionsProps) {
  const [loading, setLoading] = useState(false);
  const [isSuspended, setIsSuspended] = useState(suspended);
  const [currentRole, setCurrentRole] = useState(role);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const run = async (action: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Action failed");

      if (action === "suspend") setIsSuspended(true);
      if (action === "reactivate") setIsSuspended(false);
      if (action === "promote") setCurrentRole("ADMIN");
      if (action === "demote") setCurrentRole("USER");
      if (action === "delete" || action === "reset-usage") {
        setMessage(action === "delete" ? "User deleted." : "Usage reset.");
      }

      if (!["delete", "reset-usage"].includes(action)) {
        setMessage("Done.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete action.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  const confirmAndRun = (action: string) => {
    setPendingAction(action);
    setConfirmOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Suspend / Reactivate */}
        <Button
          variant={isSuspended ? "default" : "outline"}
          onClick={() => run(isSuspended ? "reactivate" : "suspend")}
          disabled={loading}
          className="text-xs py-1.5 px-3"
        >
          {isSuspended ? "Reactivate" : "Suspend"}
        </Button>

        {/* Promote / Demote */}
        {currentRole === "ADMIN" ? (
          <Button
            variant="secondary"
            onClick={() => run("demote")}
            disabled={loading}
            className="text-xs py-1.5 px-3"
          >
            Remove Admin
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => run("promote")}
            disabled={loading}
            className="text-xs py-1.5 px-3"
          >
            Make Admin
          </Button>
        )}

        {/* Reset usage */}
        <Button
          variant="ghost"
          onClick={() => confirmAndRun("reset-usage")}
          disabled={loading}
          className="text-xs py-1.5 px-3"
        >
          Reset Usage
        </Button>

        {/* Delete — requires confirm */}
        <Button
          variant="ghost"
          onClick={() => confirmAndRun("delete")}
          disabled={loading}
          className="text-xs py-1.5 px-3 text-rose-600 hover:bg-rose-50"
        >
          Delete
        </Button>

        {message ? <p className="w-full text-xs text-slate-500">{message}</p> : null}
      </div>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-950">Confirm action</h3>
          <p className="text-sm text-slate-600">
            {pendingAction === "delete"
              ? "This will permanently delete the user and all their data. This cannot be undone."
              : "This will reset all usage counters for this user. Continue?"}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={() => pendingAction && run(pendingAction)} disabled={loading}>
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
