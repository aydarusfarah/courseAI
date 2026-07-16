import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../lib/auth";
import { ensurePlanAccess } from "../../../lib/billing";
import { listCoursesForUser, deleteCourse, archiveCourse, restoreCourse, duplicateCourse, createCourse } from "../../../lib/course-management/crud";

export async function GET(request: NextRequest) {
  try {
    const user = await ensurePrismaUser();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "all";
    const sort = searchParams.get("sort") ?? "updated";

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

    return NextResponse.json({ courses: sorted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load courses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensurePrismaUser();
    const body = await request.json();
    const action = body?.action as string | undefined;

    if (action === "create") {
      await ensurePlanAccess(user.id, { requireCourse: true });
      const course = await createCourse(user.id, body?.payload ?? {});
      return NextResponse.json({ course });
    }

    if (action === "archive") {
      await archiveCourse(body.courseId, user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "restore") {
      await restoreCourse(body.courseId, user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      await deleteCourse(body.courseId, user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "duplicate") {
      const duplicated = await duplicateCourse(body.courseId, user.id);
      return NextResponse.json({ course: duplicated });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Course action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
