import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen, Cpu, CreditCard, ArrowRight,
  Sparkles, Clock, Zap
} from "lucide-react";
import { ensurePrismaUser } from "../../../lib/auth";
import { getPlanUsageSummary, getPlanSnapshot, planConfig, type PlanKey } from "../../../lib/billing";
import { prisma } from "../../../lib/prisma";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";
import { Tabs } from "../../../components/ui/tabs";

export default async function DashboardPage() {
  const user = await ensurePrismaUser();

  const [courses, aiRequests, usage, snapshot, recentActivity] = await Promise.all([
    prisma.course.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true }
    }),
    prisma.aIRequest.count({ where: { userId: user.id, status: "COMPLETED" } }),
    getPlanUsageSummary(user.id),
    getPlanSnapshot(user.id),
    prisma.aIRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { action: true, createdAt: true }
    })
  ]);

  const courseCount = courses.length;
  const planName = planConfig[snapshot.plan as PlanKey].name;
  const aiLimit = planConfig[snapshot.plan as PlanKey].aiLimit;
  const aiPercent =
    aiLimit === Number.POSITIVE_INFINITY
      ? 0
      : Math.min(100, Math.round((usage.aiCount / aiLimit) * 100));

  const statCards = [
    {
      label: "Total Courses",
      value: usage.courseCount,
      badge: `${courseCount} active`,
      badgeVariant: "violet" as const,
      icon: BookOpen,
      iconBg: "bg-violet-100 dark:bg-violet-950/40",
      iconColor: "text-violet-600 dark:text-violet-400"
    },
    {
      label: "AI Generations",
      value: aiRequests,
      badge: "Completed",
      badgeVariant: "success" as const,
      icon: Cpu,
      iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      label: "AI Requests Used",
      value: usage.aiCount,
      badge: aiLimit === Number.POSITIVE_INFINITY ? "Unlimited" : `/ ${aiLimit}`,
      badgeVariant: "blue" as const,
      icon: Zap,
      iconBg: "bg-blue-100 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Active Subscription",
      value: planName,
      badge: snapshot.status,
      badgeVariant: snapshot.active ? "success" as const : "default" as const,
      icon: CreditCard,
      iconBg: "bg-brand-100 dark:bg-brand-950/40",
      iconColor: "text-brand-600 dark:text-brand-400"
    }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        description="Manage your course projects, AI requests, exports, and billing from one place."
        action={
          <Link
            href="/generator"
            className="inline-flex items-center gap-1.5 rounded-xl bg-theme-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New course
          </Link>
        }
      />

      {/* ── Stat cards ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_0.64fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {statCards.map(card => (
            <Card key={card.label} className="stat-card space-y-4 hover:shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} aria-hidden="true" />
                </div>
                <Badge variant={card.badgeVariant}>{card.badge}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Usage card */}
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Usage progress</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI usage against your plan limit.</p>
            </div>
            <Badge variant={aiPercent > 80 ? "warning" : "default"}>{aiPercent}% used</Badge>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-theme-gradient transition-all duration-700"
                style={{ width: `${aiPercent}%` }}
                role="progressbar"
                aria-valuenow={aiPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="AI usage progress"
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Requests used</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{usage.aiCount}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {aiLimit === Number.POSITIVE_INFINITY ? "∞" : usage.aiRemaining}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Recent content ── */}
      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.56fr]">
        {/* Recent courses */}
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent courses</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your latest course drafts and published content.</p>
            </div>
            <Link
              href="/courses"
              className="flex items-center gap-1 text-sm font-semibold text-theme-accent hover:opacity-80 transition-opacity"
              aria-label="View all courses"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
                <BookOpen className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No courses yet</p>
                  <Link href="/generator" className="text-sm text-theme-accent hover:underline">Generate your first course →</Link>
                </div>
              </div>
            ) : (
              courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{course.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{course.status}</p>
                  </div>
                  <Badge variant="default" className="ml-3 shrink-0">
                    {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Recent AI activity */}
        <Card className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent AI activity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your latest AI generation requests.</p>
          </div>
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
                <Cpu className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No AI activity yet.</p>
              </div>
            ) : (
              recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-600" aria-hidden="true" />
                    <p className="truncate text-sm text-slate-700 dark:text-slate-300">
                      {item.action.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ── Quick actions + Admin ── */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Quick actions</h2>
          </div>
          <Tabs
            items={[
              {
                value: "actions",
                label: "Actions",
                content: (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/generator"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Create course</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Launch a new course with AI prompts.</p>
                    </Link>
                    <Link
                      href="/analytics"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">View analytics</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Check usage and AI request trends.</p>
                    </Link>
                  </div>
                )
              },
              {
                value: "notes",
                label: "Notes",
                content: (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Use the AI Generator to quickly iterate on lesson outlines, quizzes, and assignments.
                  </p>
                )
              }
            ]}
          />
        </Card>

        <Card className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Admin overview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Quick links for user management and logs.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["/admin/users",    "Manage users"],
                ["/admin/payments", "Review payments"],
                ["/admin/usage",    "View AI usage"],
                ["/admin/logs",     "Audit logs"]
              ] as const
            ).map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
