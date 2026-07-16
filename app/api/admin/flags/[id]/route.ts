import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: { enabled: Boolean(body.enabled) }
    });

    await logAdminAction(admin.id, "toggle_feature_flag", "SETTINGS", {
      targetId: id,
      details: `Set flag ${flag.name} to ${flag.enabled ? "enabled" : "disabled"}`
    });

    return NextResponse.json({ flag });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
