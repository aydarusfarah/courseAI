import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ensurePrismaUser } from "../../../../lib/auth";
import { getSystemSettings } from "../../../../lib/admin";
import { SectionHeader } from "../../../../components/section-header";
import AdminSettingsForm from "../../../../components/admin/settings-form";

export const metadata: Metadata = { title: "Admin Settings" };

export default async function AdminSettingsPage() {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") redirect("/admin/forbidden" as const);

  const settings = await getSystemSettings();

  return (
    <div className="space-y-8">
      <SectionHeader title="System Settings" description="Configure site name, AI model, rate limits, SMTP, and branding." />
      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
