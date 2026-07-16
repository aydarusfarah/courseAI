import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../../../lib/auth";
import { getCourseDetailsForUser, updateCourseContent, createRevision, createModule, updateModuleTitle, deleteModule, createLesson, updateLesson, deleteLesson, reorderLessons, moveLessonToModule } from "../../../../../lib/course-management/crud";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await ensurePrismaUser();
    const { id } = await params;
    const course = await getCourseDetailsForUser(id, user.id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await ensurePrismaUser();
    const { id } = await params;
    const body = await request.json();

    if (body?.action === "save") {
      await updateCourseContent(id, user.id, body.payload);
      await createRevision(id, user.id, body.payload.title, body.payload.description, user.email);
      return NextResponse.json({ success: true });
    }

    if (body?.action === "create-module") {
      await createModule(id, user.id, body.title ?? "New Module");
      return NextResponse.json({ success: true });
    }

    if (body?.action === "update-module") {
      await updateModuleTitle(body.moduleId, user.id, body.title);
      return NextResponse.json({ success: true });
    }

    if (body?.action === "delete-module") {
      await deleteModule(body.moduleId, user.id);
      return NextResponse.json({ success: true });
    }

    if (body?.action === "create-lesson") {
      await createLesson(body.moduleId, user.id, body.title ?? "New Lesson");
      return NextResponse.json({ success: true });
    }

    if (body?.action === "update-lesson") {
      await updateLesson(body.moduleId, user.id, body.lessonId, body.payload);
      return NextResponse.json({ success: true });
    }

    if (body?.action === "delete-lesson") {
      await deleteLesson(body.lessonId, user.id);
      return NextResponse.json({ success: true });
    }

    if (body?.action === "reorder-lessons") {
      await reorderLessons(body.moduleId, user.id, body.lessonOrder);
      return NextResponse.json({ success: true });
    }

    if (body?.action === "move-lesson") {
      await moveLessonToModule(body.lessonId, user.id, body.targetModuleId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Edit action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
