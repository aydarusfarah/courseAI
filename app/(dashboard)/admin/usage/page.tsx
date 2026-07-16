import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ensurePrismaUser } from "../../../../lib/auth";
import { getAdminUsageData } from "../../../../lib/admin";
import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";
import { Table, TableHeader, TableRow, TableCell } from "../../../../components/ui/table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin AI Usage | CourseAI"
};

export default async function AdminUsagePage() {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") redirect("/admin/forbidden" as const);
  const { usageByUser, totalTokens, failedGenerations, promptUsage } = await getAdminUsageData();

  return (
    <div className="space-y-8">
      <SectionHeader title="AI Usage" description="Monitor AI request volume, token consumption, and usage trends." />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="space-y-3 p-6">
          <p className="text-sm font-medium text-slate-500">Total Tokens</p>
          <p className="text-3xl font-bold text-slate-950">{totalTokens}</p>
          <p className="text-xs text-slate-600">Tokens consumed by AI generations</p>
        </Card>
        <Card className="space-y-3 p-6">
          <p className="text-sm font-medium text-slate-500">Failed Generations</p>
          <p className="text-3xl font-bold text-slate-950">{failedGenerations}</p>
          <p className="text-xs text-slate-600">AI requests that failed validation or processing</p>
        </Card>
        <Card className="space-y-3 p-6">
          <p className="text-sm font-medium text-slate-500">Active Users</p>
          <p className="text-3xl font-bold text-slate-950">{usageByUser.length}</p>
          <p className="text-xs text-slate-600">Users with tracked usage this period</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">Top AI Users</h3>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>User ID</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Count</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {usageByUser.map((entry) => (
              <TableRow key={`${entry.userId}-${entry.type}`}>
                <TableCell>{entry.userId}</TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell>{entry.count}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">Prompt Usage</h3>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Action</TableHeader>
              <TableHeader>Count</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {promptUsage.map((item) => (
              <TableRow key={item.action}>
                <TableCell>{item.action}</TableCell>
                <TableCell>{item._count._all}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
