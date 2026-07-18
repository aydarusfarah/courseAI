"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { clsx } from "clsx";

interface ToastProps {
  open: boolean;
  message: string;
  variant?: "success" | "warning" | "danger" | "default";
  onOpenChange?: (open: boolean) => void;
}

const config = {
  default: {
    icon: Info,
    classes: "bg-slate-900 text-white dark:bg-slate-800"
  },
  success: {
    icon: CheckCircle,
    classes: "bg-emerald-600 text-white"
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-amber-500 text-slate-950"
  },
  danger: {
    icon: XCircle,
    classes: "bg-rose-600 text-white"
  }
} as const;

export function Toast({ open, message, variant = "default", onOpenChange }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onOpenChange?.(false), 4000);
    return () => window.clearTimeout(timer);
  }, [open, onOpenChange]);

  if (!open) return null;

  const { icon: Icon, classes } = config[variant];

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3",
        "rounded-2xl px-5 py-3.5 shadow-xl shadow-black/10",
        "animate-fade-up",
        classes
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={() => onOpenChange?.(false)}
        className="ml-1 rounded-lg p-1 opacity-70 transition hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
