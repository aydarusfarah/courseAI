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
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Application preferences</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Site name",         value: settings.siteName },
              { label: "Default theme",     value: settings.defaultTheme },
              { label: "Default AI model",  value: settings.defaultAiModel },
              { label: "Rate limit",        value: `${settings.rateLimitRequests} req / ${settings.rateLimitWindow}s` }
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Contact your administrator to modify application settings.</p>
        </Card>
      )}
    </div>
  );
}
