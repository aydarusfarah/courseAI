"use client";

import { useState } from "react";
import { Button } from "../button";
import { Card } from "../card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Toast } from "../ui/toast";

interface Settings {
  id: string;
  siteName: string;
  siteBranding: string | null;
  defaultTheme: string;
  defaultAiModel: string;
  rateLimitRequests: number;
  rateLimitWindow: number;
  storageLimit: number;
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPass: string | null;
}

interface Props {
  initialSettings: Settings;
}

export default function AdminSettingsForm({ initialSettings }: Props) {
  const [form, setForm] = useState({
    siteName: initialSettings.siteName,
    siteBranding: initialSettings.siteBranding ?? "",
    defaultTheme: initialSettings.defaultTheme,
    defaultAiModel: initialSettings.defaultAiModel,
    rateLimitRequests: String(initialSettings.rateLimitRequests),
    rateLimitWindow: String(initialSettings.rateLimitWindow),
    storageLimit: String(initialSettings.storageLimit),
    smtpHost: initialSettings.smtpHost ?? "",
    smtpPort: String(initialSettings.smtpPort),
    smtpUser: initialSettings.smtpUser ?? "",
    smtpPass: initialSettings.smtpPass ?? ""
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "danger" } | null>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: form.siteName,
          siteBranding: form.siteBranding || null,
          defaultTheme: form.defaultTheme,
          defaultAiModel: form.defaultAiModel,
          rateLimitRequests: Number(form.rateLimitRequests),
          rateLimitWindow: Number(form.rateLimitWindow),
          storageLimit: Number(form.storageLimit),
          smtpHost: form.smtpHost || null,
          smtpPort: Number(form.smtpPort),
          smtpUser: form.smtpUser || null,
          smtpPass: form.smtpPass || null
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      setToast({ message: "Settings saved.", variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, id, children }: { label: string; id: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Site */}
        <Card className="space-y-5">
          <h3 className="font-semibold text-slate-950">Site Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site Name" id="siteName">
              <Input id="siteName" value={form.siteName} onChange={set("siteName")} className="border border-slate-200 bg-white px-4" />
            </Field>
            <Field label="Site Branding" id="siteBranding">
              <Input id="siteBranding" value={form.siteBranding} onChange={set("siteBranding")} placeholder="Tagline or branding text" className="border border-slate-200 bg-white px-4" />
            </Field>
            <Field label="Default Theme" id="defaultTheme">
              <Select id="defaultTheme" value={form.defaultTheme} onChange={set("defaultTheme")}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>
            <Field label="Default AI Model" id="defaultAiModel">
              <Input id="defaultAiModel" value={form.defaultAiModel} onChange={set("defaultAiModel")} className="border border-slate-200 bg-white px-4" />
            </Field>
          </div>
        </Card>

        {/* Rate limits */}
        <Card className="space-y-5">
          <h3 className="font-semibold text-slate-950">Rate Limits &amp; Storage</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Requests per window" id="rateLimitRequests">
              <Input id="rateLimitRequests" type="number" value={form.rateLimitRequests} onChange={set("rateLimitRequests")} className="border border-slate-200 bg-white px-4" />
            </Field>
            <Field label="Window (seconds)" id="rateLimitWindow">
              <Input id="rateLimitWindow" type="number" value={form.rateLimitWindow} onChange={set("rateLimitWindow")} className="border border-slate-200 bg-white px-4" />
            </Field>
            <Field label="Storage limit (bytes)" id="storageLimit">
              <Input id="storageLimit" type="number" value={form.storageLimit} onChange={set("storageLimit")} className="border border-slate-200 bg-white px-4" />
            </Field>
          </div>
        </Card>

        {/* SMTP */}
        <Card className="space-y-5">
          <h3 className="font-semibold text-slate-950">SMTP / Email</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SMTP Host" id="smtpHost">
              <Input id="smtpHost" value={form.smtpHost} onChange={set("smtpHost")} placeholder="smtp.example.com" className="border border-slate-200 bg-white px-4" />
            </Field>
            <Field label="SMTP Port" id="smtpPort">
              <Input id="smtpPort" type="number" value={form.smtpPort} onChange={set("smtpPort")} className="border border-slate-200 bg-white px-4" />
            </Field>
            <Field label="SMTP Username" id="smtpUser">
              <Input id="smtpUser" value={form.smtpUser} onChange={set("smtpUser")} placeholder="admin@example.com" className="border border-slate-200 bg-white px-4" />
            </Field>
            <Field label="SMTP Password" id="smtpPass">
              <Input id="smtpPass" type="password" value={form.smtpPass} onChange={set("smtpPass")} placeholder="••••••••" className="border border-slate-200 bg-white px-4" />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {toast && (
        <Toast open message={toast.message} variant={toast.variant} onOpenChange={() => setToast(null)} />
      )}
    </>
  );
}
