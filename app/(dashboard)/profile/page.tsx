import { ensurePrismaUser } from "../../../lib/auth";
import { getPlanSnapshot } from "../../../lib/billing";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";
import { User, Mail, ShieldCheck, CreditCard, Calendar, Activity } from "lucide-react";

export default async function ProfilePage() {
  const user = await ensurePrismaUser();
  const snapshot = await getPlanSnapshot(user.id);

  const planName = snapshot.plan === "PRO" ? "Pro" : "Free";
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  const profileFields = [
    { label: "Full name",          value: user.name ?? "—",              icon: User },
    { label: "Email address",      value: user.email,                    icon: Mail },
    { label: "Account role",       value: user.role,                     icon: ShieldCheck },
    { label: "Subscription plan",  value: planName,                      icon: CreditCard },
    { label: "Member since",       value: joinedDate,                    icon: Calendar },
    { label: "Account status",     value: user.suspended ? "Suspended" : "Active", icon: Activity }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader title="Profile" description="View and edit your account profile, contact information, and preferences." />

      <Card className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-gradient text-xl font-bold text-white shadow-glow">
              {(user.name ?? user.email)?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-theme-accent">Account</p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name ?? "CourseAI User"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <Badge variant={snapshot.active ? "success" : "default"} size="md">{planName} plan</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {profileFields.map(f => (
            <div
              key={f.label}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-slate-800">
                <f.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{f.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
