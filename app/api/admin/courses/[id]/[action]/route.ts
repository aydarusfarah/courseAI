import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, archiveCourse, restoreCourse, deleteCourse, duplicateCourse, logAdminAction } from "../../../../../../lib/admin";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id, action } = await params;

    if (action === "archive") {
      await archiveCourse(id);
      await logAdminAction(admin.id, "archive_course", "COURSE_MANAGEMENT", { targetId: id });
      return NextResponse.json({ success: true });
    }

    if (action === "restore") {
      await restoreCourse(id);
      await logAdminAction(admin.id, "restore_course", "COURSE_MANAGEMENT", { targetId: id });
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      await deleteCourse(id);
      await logAdminAction(admin.id, "delete_course", "COURSE_MANAGEMENT", { targetId: id });
      return NextResponse.json({ success: true });
    }

    if (action === "duplicate") {
      const copy = await duplicateCourse(id, admin.id);
      await logAdminAction(admin.id, "duplicate_course", "COURSE_MANAGEMENT", { targetId: id, details: copy?.id });
      return NextResponse.json({ success: true, copyId: copy?.id });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: error instanceof Error && error.message.includes("Admin") ? 403 : 500 });
  }
}
