import { ensurePrismaUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";
import { BookOpen, Cpu, TrendingUp, FileText } from "lucide-react";

export default async function AnalyticsPage() {
  const user = await ensurePrismaUser();

  const [courseCount, aiCompleted, aiFailed, exportCount, recentRequests] = await Promise.all([
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

  const stats = [
    { label: "Active Courses",  value: courseCount,   icon: BookOpen,  iconBg: "bg-violet-100 dark:bg-violet-950/40", iconColor: "text-violet-600 dark:text-violet-400" },
    { label: "AI Generations",  value: aiCompleted,   icon: Cpu,       iconBg: "bg-emerald-100 dark:bg-emerald-950/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Success Rate",    value: `${successRate}%`, icon: TrendingUp, iconBg: "bg-blue-100 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400" },
    { label: "Total Exports",   value: exportTotal,   icon: FileText,  iconBg: "bg-amber-100 dark:bg-amber-950/40", iconColor: "text-amber-600 dark:text-amber-400" }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader title="Analytics" description="Track performance, engagement, and AI usage across your courses." />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="stat-card space-y-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}>
              <s.icon className={`h-5 w-5 ${s.iconColor}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent AI activity</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your last 10 AI generation requests.</p>
        </div>
        <div className="space-y-2">
          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-700">
              <Cpu className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No AI activity yet. Generate a course to get started.</p>
            </div>
          ) : (
            recentRequests.map((item, index) => (
              <div key={index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {item.action.replace(/_/g, " ").toLowerCase()}
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant={item.status === "COMPLETED" ? "success" : "danger"}>
                    {item.status.toLowerCase()}
                  </Badge>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
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
