import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, updateFeedback, archiveFeedback } from "../../../../../lib/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body?.action === "archive") {
      await archiveFeedback(id);
      await logAdminAction(admin.id, "archive_feedback", "FEEDBACK", { targetId: id });
      return NextResponse.json({ success: true });
    }

    const updated = await updateFeedback(id, {
      status: body.status,
      response: body.response,
      resolved: body.resolved
    });

    await logAdminAction(admin.id, "update_feedback", "FEEDBACK", {
      targetId: id,
      details: `Status: ${body.status ?? "unchanged"}`
    });

    return NextResponse.json({ feedback: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
