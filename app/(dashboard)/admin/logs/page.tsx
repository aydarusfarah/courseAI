import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ensurePrismaUser } from "../../../../lib/auth";
import { getAdminLogs } from "../../../../lib/admin";
import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";
import { Table, TableHeader, TableRow, TableCell } from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";

export const metadata: Metadata = {
  title: "Admin Logs | CourseAI"
};

const CATEGORIES = ["all", "USER_MANAGEMENT", "COURSE_MANAGEMENT", "BILLING", "SETTINGS", "FEEDBACK", "PROMPT_TEMPLATES"];

const categoryColor: Record<string, "default" | "success" | "warning" | "danger"> = {
  BILLING: "success",
  USER_MANAGEMENT: "warning",
  COURSE_MANAGEMENT: "default",
  SETTINGS: "default",
  FEEDBACK: "default",
  PROMPT_TEMPLATES: "default"
};

export default async function AdminLogsPage(props: {
  searchParams?: Promise<{ category?: string; page?: string }>;
}) {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") redirect("/admin/forbidden" as const);

  const searchParams = await (props.searchParams ?? Promise.resolve({} as { category?: string; page?: string }));
  const category = searchParams?.category;
  const page = Number(searchParams?.page ?? "1");

  const { logs, total, perPage } = await getAdminLogs({ category, page, perPage: 50 });

  return (
    <div className="space-y-8">
      <SectionHeader title="System Logs" description="Review admin actions, audit trail, and application events." />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/admin/logs?category=${cat}&page=1`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              (category ?? "all") === cat
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {cat === "all" ? "All" : cat.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <Card>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Action</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Target</TableHeader>
              <TableHeader>Details</TableHeader>
              <TableHeader>When</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {logs.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.action.replace(/_/g, " ")}</TableCell>
                <TableCell>
                  <Badge variant={categoryColor[entry.category] ?? "default"}>
                    {entry.category.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>{entry.target ?? entry.targetId ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate text-slate-500">{entry.details ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-500">
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>

        {logs.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">No log entries found.</p>
        )}

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/logs?category=${category ?? "all"}&page=${Math.max(1, page - 1)}`}
              className="rounded-md border px-3 py-1 text-sm"
            >
              Prev
            </Link>
            <Link
              href={`/admin/logs?category=${category ?? "all"}&page=${page + 1}`}
              className="rounded-md border px-3 py-1 text-sm"
            >
              Next
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
