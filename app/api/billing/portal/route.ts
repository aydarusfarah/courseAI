import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../../lib/auth";
import { createBillingPortalSession } from "../../../../lib/billing";

export async function POST(request: NextRequest) {
  try {
    const user = await ensurePrismaUser();
    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    const session = await createBillingPortalSession(user.id, `${origin}/billing`);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portal failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
