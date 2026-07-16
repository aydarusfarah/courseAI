import { NextRequest, NextResponse } from "next/server";
import { ensurePrismaUser } from "../../../../lib/auth";
import { stripe } from "../../../../lib/billing";
import { prisma } from "../../../../lib/prisma";

export async function POST(_request: NextRequest) {
  try {
    const user = await ensurePrismaUser();
    const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });

    if (!subscription?.stripeId || !stripe) {
      return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
    }

    const updated = await stripe.subscriptions.update(subscription.stripeId, { cancel_at_period_end: true });
    const cancelAt = updated.cancel_at ? new Date(updated.cancel_at * 1000) : null;
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAt }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancellation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
