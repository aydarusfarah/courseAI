import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../lib/auth";
import { getPlanSnapshot, getPlanUsageSummary } from "../../../lib/billing";

export async function GET(request: NextRequest) {
  try {
    const user = await ensurePrismaUser();
    const snapshot = await getPlanSnapshot(user.id);
    const usage = await getPlanUsageSummary(user.id);
    return NextResponse.json({ snapshot, usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load billing status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
