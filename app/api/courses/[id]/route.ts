import { NextRequest, NextResponse } from "next/server";
import { AuthError, ensurePrismaUser } from "../../../../lib/auth";
import { getCourseForUser, serializeCoursePreview } from "../../../../lib/course";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await ensurePrismaUser();
    const { id } = await context.params;
    const course = await getCourseForUser(id, user.id);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course: serializeCoursePreview(course) });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Failed to load course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
