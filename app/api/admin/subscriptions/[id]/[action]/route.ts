import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "../../../../../../lib/admin";
import { stripe, syncSubscriptionFromStripe } from "../../../../../../lib/billing";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id, action } = await params;

    const subscription = await prisma.subscription.findUnique({ where: { id } });
    if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    if (action === "cancel") {
      // Cancel in Stripe first (immediate cancellation), then sync DB from Stripe response.
      if (stripe && subscription.stripeId) {
        await stripe.subscriptions.cancel(subscription.stripeId);
        await syncSubscriptionFromStripe(subscription.userId, subscription.stripeId);
      } else {
        // No Stripe configured — update DB directly as fallback.
        await prisma.subscription.update({ where: { id }, data: { cancelAt: new Date(), status: "CANCELED" } });
      }
      await logAdminAction(admin.id, "cancel_subscription", "BILLING", { targetId: id });
      return NextResponse.json({ success: true });
    }

    if (action === "reactivate") {
      // Remove cancellation schedule in Stripe, then sync DB.
      if (stripe && subscription.stripeId) {
        await stripe.subscriptions.update(subscription.stripeId, { cancel_at_period_end: false });
        await syncSubscriptionFromStripe(subscription.userId, subscription.stripeId);
      } else {
        await prisma.subscription.update({ where: { id }, data: { cancelAt: null, status: "ACTIVE" } });
      }
      await logAdminAction(admin.id, "reactivate_subscription", "BILLING", { targetId: id });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
