import Link from "next/link";
import { notFound } from "next/navigation";
import { ensurePrismaUser } from "../../../../lib/auth";
import { getCourseForUser, serializeCoursePreview } from "../../../../lib/course";
import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";
import { Button } from "../../../../components/button";
import { Badge } from "../../../../components/ui/badge";
import { CourseEditor } from "../../../../components/course-management/course-editor";
import { CourseActionButtons } from "../../../../components/course-management/course-actions";
import { CourseExportActions } from "../../../../components/course-management/course-export";
import { LearningSuite } from "../../../../components/learning-suite";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const user = await ensurePrismaUser();
  const { id } = await params;
  const course = await getCourseForUser(id, user.id);

  if (!course) {
    notFound();
  }

  const preview = serializeCoursePreview(course);

  return (
    <div className="space-y-8">
      <SectionHeader
        title={course.title}
        description="Review your generated course content, modules, and learning materials."
      />

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">{course.status}</Badge>
          <Badge variant="success">{course.difficulty}</Badge>
          <span className="text-sm text-slate-600">{course.lessonCount} lessons · {course.duration}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses">
            <Button variant="outline">Back to courses</Button>
          </Link>
          <CourseActionButtons course={course} />
          <CourseExportActions courseId={course.id} />
          <Link href="/generator">
            <Button variant="secondary">Generate another</Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
        <CourseEditor courseId={course.id} />
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-950">Course preview</h3>
            <p className="text-sm text-slate-600">A quick snapshot of the generated course content.</p>
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{preview.title}</p>
                <p className="mt-2 text-sm text-slate-600">{preview.description}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Modules</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {preview.modules.map((module) => (
                    <li key={module.title}>{module.title} ({module.lessons.length} lessons)</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
          <LearningSuite courseId={course.id} />
        </div>
      </div>
    </div>
  );
}
