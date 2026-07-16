"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ToastProps {
  open: boolean;
  message: string;
  variant?: "success" | "warning" | "danger" | "default";
  onOpenChange?: (open: boolean) => void;
}

const variantClasses: Record<NonNullable<ToastProps["variant"]>, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-slate-950",
  danger: "bg-rose-600 text-white"
};

export function Toast({ open, message, variant = "default", onOpenChange }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onOpenChange?.(false), 3600);
    return () => window.clearTimeout(timer);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-3xl px-5 py-4 shadow-xl ${variantClasses[variant]}`}>
      <span>{message}</span>
      <button type="button" onClick={() => onOpenChange?.(false)} className="rounded-full p-2 text-white transition hover:bg-white/10">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
