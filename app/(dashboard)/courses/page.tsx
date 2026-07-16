import Link from "next/link";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Table, TableHeader, TableRow, TableCell } from "../../../components/ui/table";
import { Button } from "../../../components/button";
import { ensurePrismaUser } from "../../../lib/auth";
import { listCoursesForUser } from "../../../lib/course-management/crud";
import { CreateCourseButton, CourseActionButtons } from "../../../components/course-management/course-actions";

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; sort?: string }> }) {
  const user = await ensurePrismaUser();
  const params = await searchParams;
  const search = params?.search ?? "";
  const status = params?.status ?? "all";
  const sort = params?.sort ?? "updated";

  const courses = await listCoursesForUser(user.id);
  const filtered = courses.filter((course) => {
    const matchesSearch = !search || `${course.title} ${course.description}`.toLowerCase().includes(search.toLowerCase());
    const archived = Boolean((course as { archivedAt?: Date | null }).archivedAt);
    const matchesStatus = status === "all" || (status === "archived" ? archived : status === "active" ? !archived : course.status === status.toUpperCase());
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-8">
      <SectionHeader title="My Courses" description="Browse your course catalog, manage drafts, and publish new learning experiences." />

      <Card className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Course catalog</h3>
            <p className="text-sm text-slate-600">A quick view of your active and draft courses.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CreateCourseButton />
            <Link href="/generator">
              <Button variant="outline">Open generator</Button>
            </Link>
          </div>
        </div>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Course</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Modules</TableHeader>
              <TableHeader>Updated</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {sorted.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{course.title}</p>
                    <p className="text-xs text-slate-500">{course.topic}</p>
                  </div>
                </TableCell>
                <TableCell>{(course as { archivedAt?: Date | null }).archivedAt ? "Archived" : course.status}</TableCell>
                <TableCell>{Number((course as { _count?: { modules?: number } })._count?.modules ?? 0)}</TableCell>
                <TableCell>{new Date(course.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/courses/${course.id}`}>
                      <Button variant="outline">Open</Button>
                    </Link>
                    <Link href={`/courses/${course.id}`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <CourseActionButtons course={course} compact />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
