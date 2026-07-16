import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../../../lib/auth";
import { ensurePlanAccessForExport, incrementUsage } from "../../../../../lib/billing";
import { getCourseForUser } from "../../../../../lib/course";
import { exportCourse } from "../../../../../lib/export/registry";
import type { ExportFormat } from "../../../../../lib/export/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await ensurePrismaUser();
    const { id } = await params;
    const { format } = await request.json();

    const course = await getCourseForUser(id, user.id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await ensurePlanAccessForExport(user.id, format as string);

    const payload = {
      id: course.id,
      title: course.title,
      description: course.description,
      topic: course.topic,
      audience: course.audience,
      difficulty: course.difficulty,
      language: course.language,
      tone: course.tone,
      lessonCount: course.lessonCount,
      duration: course.duration,
      status: course.status,
      modules: course.modules.map((module) => ({
        title: module.title,
        lessons: module.lessons.map((lesson) => ({
          title: lesson.title,
          content: lesson.content,
          examples: lesson.examples,
          exercises: lesson.exercises
        }))
      })),
      quizzes: course.modules.flatMap((module) =>
        module.lessons.flatMap((lesson) =>
          lesson.questionSet?.questions.map((question) => ({
            lessonTitle: lesson.title,
            question: question.prompt,
            answer: question.answer,
            options: question.options
          })) ?? []
        )
      ),
      assignments: course.modules.flatMap((module) =>
        module.lessons.flatMap((lesson) =>
          lesson.assignments.map((assignment) => ({
            lessonTitle: lesson.title,
            title: assignment.title,
            description: assignment.description
          }))
        )
      ),
      certificateContent: course.certificate?.content
    };

    const result = await exportCourse(payload, format as ExportFormat);
    await incrementUsage(user.id, "EXPORT");

    return new NextResponse(result.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "x-export-filename": result.filename
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
