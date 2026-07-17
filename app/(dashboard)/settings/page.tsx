import { ensurePrismaUser } from "../../../lib/auth";
import { getSystemSettings } from "../../../lib/admin";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import AdminSettingsForm from "../../../components/admin/settings-form";

export default async function SettingsPage() {
  const user = await ensurePrismaUser();
  const settings = await getSystemSettings();

  return (
    <div className="space-y-8">
      <SectionHeader title="Settings" description="Manage your profile, account preferences, and application settings." />
      {user.role === "ADMIN" ? (
        <AdminSettingsForm initialSettings={settings} />
      ) : (
        <Card className="space-y-5">
          <p className="text-sm font-semibold text-slate-900">Application preferences</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Site name</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{settings.siteName}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Default theme</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{settings.defaultTheme}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Default AI model</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{settings.defaultAiModel}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Rate limit (requests)</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{settings.rateLimitRequests} per {settings.rateLimitWindow}s</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">Contact your administrator to modify application settings.</p>
        </Card>
      )}
    </div>
  );
}

