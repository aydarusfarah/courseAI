import { ensurePrismaUser } from "../../../lib/auth";
import { listCoursesForUser } from "../../../lib/course-management/crud";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";
import { CourseExportActions } from "../../../components/course-management/course-export";
import Link from "next/link";

export default async function ExportsPage() {
  const user = await ensurePrismaUser();
  const courses = await listCoursesForUser(user.id);

  return (
    <div className="space-y-8">
      <SectionHeader title="Exports" description="Manage your course exports, downloads, and content package delivery." />

      {courses.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm text-slate-600">
            Export options will appear here once you&apos;ve generated course content.{" "}
            <Link href="/generator" className="text-brand-600 hover:underline">Generate your first course.</Link>
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{course.title}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">{course.status}</Badge>
                    <span className="text-xs text-slate-500">{course.topic}</span>
                  </div>
                </div>
                <Link href={`/courses/${course.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  View course
                </Link>
              </div>
              <CourseExportActions courseId={course.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
