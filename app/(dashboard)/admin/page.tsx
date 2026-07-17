import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ensurePrismaUser } from "../../../lib/auth";
import { getAdminDashboardStats, getAdminDashboardTrends } from "../../../lib/admin";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import AdminTrendsCharts from "../../../components/admin/trends-charts";

export default async function AdminDashboardPage() {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") {
    redirect("/admin/forbidden" as const);
  }

  const [stats, trends] = await Promise.all([
    getAdminDashboardStats(),
    getAdminDashboardTrends()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Admin Dashboard"
        description="Monitor platform metrics, users, billing, and system health."
      />

      {/* KPI cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-2 p-6">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <p className="text-3xl font-bold text-slate-950">{stats.totalUsers}</p>
          <p className="text-xs text-slate-600">{stats.activeUsers} active this month</p>
        </Card>
        <Card className="space-y-2 p-6">
          <p className="text-sm font-medium text-slate-500">New Users</p>
          <p className="text-3xl font-bold text-slate-950">{stats.newUsersThisMonth}</p>
          <p className="text-xs text-slate-600">This month</p>
        </Card>
        <Card className="space-y-2 p-6">
          <p className="text-sm font-medium text-slate-500">Premium Users</p>
          <p className="text-3xl font-bold text-slate-950">{stats.premiumUsers}</p>
          <p className="text-xs text-slate-600">{stats.freeUsers} on Free plan</p>
        </Card>
        <Card className="space-y-2 p-6">
          <p className="text-sm font-medium text-slate-500">Total Courses</p>
          <p className="text-3xl font-bold text-slate-950">{stats.totalCourses}</p>
          <p className="text-xs text-slate-600">All active courses</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="space-y-2 p-6">
          <p className="text-sm font-medium text-slate-500">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-950">${stats.monthlyRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-600">All-time from subscriptions</p>
        </Card>
        <Card className="space-y-2 p-6">
          <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
          <p className="text-3xl font-bold text-slate-950">{stats.activeSubscriptions}</p>
          <p className="text-xs text-slate-600">{stats.cancelledSubscriptions} cancelled</p>
        </Card>
        <Card className="space-y-2 p-6">
          <p className="text-sm font-medium text-slate-500">AI Generations</p>
          <p className="text-3xl font-bold text-slate-950">{stats.totalAiRequests}</p>
          <p className="text-xs text-slate-600">Total completed</p>
        </Card>
      </div>

      {/* Trend charts (client component) */}
      <AdminTrendsCharts trends={trends} />

      {/* Quick Actions */}
      <Card className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-slate-950">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {(
            [
              { href: "/admin/users", label: "Manage Users" },
              { href: "/admin/courses", label: "Manage Courses" },
              { href: "/admin/payments", label: "View Payments" },
              { href: "/admin/subscriptions", label: "Subscriptions" },
              { href: "/admin/usage", label: "AI Usage" },
              { href: "/admin/logs", label: "System Logs" },
              { href: "/admin/prompt-templates", label: "Prompt Templates" },
              { href: "/admin/flags", label: "Feature Flags" },
              { href: "/admin/feedback", label: "Feedback" },
              { href: "/admin/settings", label: "Settings" }
            ] as { href: Route; label: string }[]
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
