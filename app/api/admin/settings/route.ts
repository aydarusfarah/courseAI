import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, getSystemSettings, updateSystemSettings } from "../../../../lib/admin";

export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();
    const settings = await getSystemSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    // Allow updating only known safe fields — never allow free-form overwrite
    const allowed = [
      "siteName",
      "siteBranding",
      "defaultTheme",
      "defaultAiModel",
      "rateLimitRequests",
      "rateLimitWindow",
      "storageLimit",
      "smtpHost",
      "smtpPort",
      "smtpUser",
      "smtpPass"
    ] as const;

    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }

    const settings = await updateSystemSettings(data);

    await logAdminAction(admin.id, "update_system_settings", "SETTINGS", {
      details: `Updated fields: ${Object.keys(data).join(", ")}`
    });

    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
