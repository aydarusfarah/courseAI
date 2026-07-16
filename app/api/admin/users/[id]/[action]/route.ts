import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, promoteAdmin, demoteAdmin, deleteUser, resetUserUsage } from "../../../../../../lib/admin";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id, action } = await params;

    if (action === "suspend") {
      await prisma.user.update({ where: { id }, data: { suspended: true } });
      await logAdminAction(admin.id, "suspend_user", "USER_MANAGEMENT", { targetId: id, details: `Suspended user ${id}` });
      return NextResponse.json({ success: true });
    }

    if (action === "reactivate") {
      await prisma.user.update({ where: { id }, data: { suspended: false } });
      await logAdminAction(admin.id, "reactivate_user", "USER_MANAGEMENT", { targetId: id, details: `Reactivated user ${id}` });
      return NextResponse.json({ success: true });
    }

    if (action === "promote") {
      await promoteAdmin(id);
      await logAdminAction(admin.id, "promote_admin", "USER_MANAGEMENT", { targetId: id, details: `Promoted user ${id} to ADMIN` });
      return NextResponse.json({ success: true });
    }

    if (action === "demote") {
      await demoteAdmin(id);
      await logAdminAction(admin.id, "demote_admin", "USER_MANAGEMENT", { targetId: id, details: `Demoted user ${id} from ADMIN` });
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      await deleteUser(id);
      await logAdminAction(admin.id, "delete_user", "USER_MANAGEMENT", { targetId: id, details: `Deleted user ${id}` });
      return NextResponse.json({ success: true });
    }

    if (action === "reset-usage") {
      await resetUserUsage(id);
      await logAdminAction(admin.id, "reset_usage", "USER_MANAGEMENT", { targetId: id, details: `Reset usage for user ${id}` });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: error instanceof Error && error.message.includes("Admin") ? 403 : 500 });
  }
}
