import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ensurePrismaUser } from "../../../../lib/auth";
import { getFeatureFlags } from "../../../../lib/admin";
import { SectionHeader } from "../../../../components/section-header";
import FeatureFlagList from "../../../../components/admin/feature-flag-list";

export const metadata: Metadata = { title: "Feature Flags | Admin" };

export default async function AdminFlagsPage() {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") redirect("/admin/forbidden" as const);

  const flags = await getFeatureFlags();

  return (
    <div className="space-y-8">
      <SectionHeader title="Feature Flags" description="Enable or disable experimental and rollout features platform-wide." />
      <FeatureFlagList initialFlags={flags} />
    </div>
  );
}
