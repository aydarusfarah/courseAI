import { ensurePrismaUser } from "../../../lib/auth";
import { getPlanSnapshot } from "../../../lib/billing";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";

export default async function ProfilePage() {
  const user = await ensurePrismaUser();
  const snapshot = await getPlanSnapshot(user.id);

  const planName = snapshot.plan === "PRO" ? "Pro" : "Free";
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-8">
      <SectionHeader title="Profile" description="View and edit your account profile, contact information, and preferences." />

      <Card className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Account</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">{user.name ?? "CourseAI User"}</h3>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>
          <Badge variant={snapshot.active ? "success" : "default"}>{planName} plan</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Full name</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{user.name ?? "—"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Email address</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{user.email}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Account role</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{user.role}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Subscription plan</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{planName}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Member since</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{joinedDate}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Account status</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{user.suspended ? "Suspended" : "Active"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

