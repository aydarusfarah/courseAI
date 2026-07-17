import type { Metadata } from "next";
import { format } from "date-fns";
import { getAdminCourses } from "../../../../lib/admin";
import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";
import { Table, TableHeader, TableRow, TableCell } from "../../../../components/ui/table";
import Link from "next/link";
import CourseActions from "../../../../components/admin/course-actions";

export const metadata: Metadata = {
  title: "Admin Courses | CourseAI"
};

export default async function AdminCoursesPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await (props.searchParams ?? Promise.resolve({} as { [key: string]: string | string[] | undefined }));
  const page = Number(resolvedParams?.page ?? "1");
  const { courses, total, page: currentPage, perPage } = await getAdminCourses({ page, perPage: 50, search: resolvedParams?.search as string | undefined });

  return (
    <div className="space-y-8">
      <SectionHeader title="Courses" description="Manage platform courses: archive, restore, delete, or duplicate." />
      <Card>
        <form method="get" className="mb-4 flex gap-2">
          <input name="search" defaultValue={resolvedParams?.search ?? ""} placeholder="Search courses" className="w-full rounded-md border px-3 py-2" />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-white">Search</button>
        </form>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Author</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Updated</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.title}</TableCell>
                <TableCell>{c.user?.name ?? c.user?.email}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{format(new Date(c.updatedAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <CourseActions courseId={c.id} archivedAt={c.archivedAt} />
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, total)} of {total}</div>
          <div className="flex gap-2">
            <Link href={`/admin/courses?page=${Math.max(1, currentPage - 1)}`} className="rounded-md border px-3 py-1">Prev</Link>
            <Link href={`/admin/courses?page=${currentPage + 1}`} className="rounded-md border px-3 py-1">Next</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
