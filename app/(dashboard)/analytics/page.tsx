import { ensurePrismaUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";

export default async function AnalyticsPage() {
  const user = await ensurePrismaUser();

  const [
    courseCount,
    aiCompleted,
    aiFailed,
    exportCount,
    recentRequests
  ] = await Promise.all([
    prisma.course.count({ where: { userId: user.id, deletedAt: null } }),
    prisma.aIRequest.count({ where: { userId: user.id, status: "COMPLETED" } }),
    prisma.aIRequest.count({ where: { userId: user.id, status: "FAILED" } }),
    prisma.usage.findFirst({ where: { userId: user.id, type: "EXPORT" } }),
    prisma.aIRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { action: true, status: true, createdAt: true }
    })
  ]);

  const exportTotal = exportCount?.count ?? 0;
  const successRate = (aiCompleted + aiFailed) > 0
    ? Math.round((aiCompleted / (aiCompleted + aiFailed)) * 100)
    : 100;

  return (
    <div className="space-y-8">
      <SectionHeader title="Analytics" description="Track performance, engagement, and AI usage across your courses." />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-sm font-medium text-slate-500">Active Courses</p>
          <p className="text-3xl font-semibold text-slate-950">{courseCount}</p>
        </Card>
        <Card className="space-y-3">
          <p className="text-sm font-medium text-slate-500">AI Generations</p>
          <p className="text-3xl font-semibold text-slate-950">{aiCompleted}</p>
        </Card>
        <Card className="space-y-3">
          <p className="text-sm font-medium text-slate-500">Success Rate</p>
          <p className="text-3xl font-semibold text-slate-950">{successRate}%</p>
        </Card>
        <Card className="space-y-3">
          <p className="text-sm font-medium text-slate-500">Total Exports</p>
          <p className="text-3xl font-semibold text-slate-950">{exportTotal}</p>
        </Card>
      </div>

      <Card className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Recent AI activity</h3>
          <p className="text-sm text-slate-600">Your last 10 AI generation requests.</p>
        </div>
        <div className="space-y-3">
          {recentRequests.length === 0 ? (
            <p className="text-sm text-slate-600">No AI activity yet. Generate a course to get started.</p>
          ) : (
            recentRequests.map((item, index) => (
              <div key={index} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-700">{item.action.replace(/_/g, " ").toLowerCase()}</p>
                <div className="flex items-center gap-3">
                  <Badge variant={item.status === "COMPLETED" ? "success" : "default"}>
                    {item.status.toLowerCase()}
                  </Badge>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

