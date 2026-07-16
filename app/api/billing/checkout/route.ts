import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../../lib/auth";
import { createCheckoutSession } from "../../../../lib/billing";

export async function POST(request: NextRequest) {
  try {
    const user = await ensurePrismaUser();
    const body = await request.json();
    const plan = body?.plan === "yearly" ? "yearly" : "monthly";
    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    const session = await createCheckoutSession(user.id, plan, `${origin}/billing?checkout=success`, `${origin}/billing?checkout=cancelled`);

    return NextResponse.json({ sessionUrl: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
