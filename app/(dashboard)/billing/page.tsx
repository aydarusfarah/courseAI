import { ensurePrismaUser } from "../../../lib/auth";
import { getPlanSnapshot, getPlanUsageSummary } from "../../../lib/billing";
import { prisma } from "../../../lib/prisma";
import { BillingCard } from "../../../components/billing-card";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";

export default async function BillingPage() {
  const user = await ensurePrismaUser();
  const [snapshot, usage, payments] = await Promise.all([
    getPlanSnapshot(user.id),
    getPlanUsageSummary(user.id),
    prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  const nextRenewal = snapshot.currentPeriodEnd ? new Date(snapshot.currentPeriodEnd).toLocaleDateString() : null;

  return (
    <div className="space-y-8">
      <SectionHeader title="Billing" description="Review your subscription plan, usage budget, and payment history." />
      <BillingCard
        planName={snapshot.plan === "PRO" ? "Pro" : "Free"}
        status={snapshot.status}
        nextRenewal={nextRenewal}
        usage={usage}
      />
      <Card className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-950">Invoices</h3>
        <div className="space-y-3">
          {payments.length === 0 ? (
            <p className="text-sm text-slate-600">No invoices yet. Upgrade to Pro to start billing.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{payment.stripePaymentId ?? payment.id}</p>
                    <p className="text-sm text-slate-600">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">${(payment.amount / 100).toFixed(2)}</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{payment.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
