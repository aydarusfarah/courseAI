import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "../../../../../../lib/admin";
import { stripe } from "../../../../../../lib/billing";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    // Issue the real Stripe refund first; only update the DB after success.
    if (stripe && payment.stripePaymentId) {
      await stripe.refunds.create({ payment_intent: payment.stripePaymentId });
    }

    await prisma.payment.update({ where: { id }, data: { status: "refunded" } });
    await logAdminAction(admin.id, "refund_payment", "BILLING", { targetId: id, details: `Refunded ${id}` });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to refund";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
