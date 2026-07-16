import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
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

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        description="Manage your course projects, AI requests, exports, and billing from one place."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.64fr]">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Courses</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{usage.courseCount}</p>
              </div>
              <Badge variant="default">{courseCount} active</Badge>
            </div>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">AI Generations</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{aiRequests}</p>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">AI Requests Used</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{usage.aiCount}</p>
              </div>
              <Badge variant="default">
                {aiLimit === Number.POSITIVE_INFINITY ? "Unlimited" : `/ ${aiLimit}`}
              </Badge>
            </div>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Subscription</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{planName}</p>
              </div>
              <Badge variant={snapshot.active ? "success" : "default"}>{snapshot.status}</Badge>
            </div>
          </Card>
        </div>

        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Usage progress</p>
              <p className="text-sm text-slate-600">AI generation usage against your plan limit.</p>
            </div>
            <Badge variant="default">{aiPercent}% used</Badge>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${aiPercent}%` }} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Requests</p>
              <p className="text-lg font-semibold text-slate-950">{usage.aiCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="text-lg font-semibold text-slate-950">
                {aiLimit === Number.POSITIVE_INFINITY ? "∞" : usage.aiRemaining}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.56fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Recent courses</h3>
              <p className="text-sm text-slate-600">Your latest course drafts and published content.</p>
            </div>
            <Link href="/courses" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-sm text-slate-600">No courses yet. <Link href="/generator" className="text-brand-600 hover:underline">Generate your first course.</Link></p>
            ) : (
              courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{course.title}</p>
                      <p className="text-sm text-slate-600">{course.status}</p>
                    </div>
                    <Badge variant="default">{formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}</Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Recent AI activity</h3>
            <p className="text-sm text-slate-600">Your latest AI generation requests.</p>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-600">No AI activity yet.</p>
            ) : (
              recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm text-slate-700">{item.action.replace(/_/g, " ").toLowerCase()}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-950">Quick actions</h3>
          </div>
          <Tabs
            items={[
              {
                value: "actions",
                label: "Actions",
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Link href="/generator" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                      <p className="text-sm font-semibold text-slate-900">Create course</p>
                      <p className="mt-1 text-sm text-slate-600">Launch a new course with AI prompts and lesson templates.</p>
                    </Link>
                    <Link href="/analytics" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100">
                      <p className="text-sm font-semibold text-slate-900">View analytics</p>
                      <p className="mt-1 text-sm text-slate-600">Check usage and AI request trends for your courses.</p>
                    </Link>
                  </div>
                )
              },
              {
                value: "notes",
                label: "Notes",
                content: (
                  <p className="text-sm text-slate-600">
                    Use the AI Generator to quickly iterate on lesson outlines, quizzes, and assignments.
                  </p>
                )
              }
            ]}
          />
        </Card>

        <Card className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Admin overview</h3>
            <p className="text-sm text-slate-600">Quick links for user management, payments, subscriptions, and logs.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/admin/users" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 hover:bg-slate-100">
              Manage users
            </Link>
            <Link href="/admin/payments" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 hover:bg-slate-100">
              Review payments
            </Link>
            <Link href="/admin/usage" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 hover:bg-slate-100">
              View AI usage
            </Link>
            <Link href="/admin/logs" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 hover:bg-slate-100">
              Audit logs
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
