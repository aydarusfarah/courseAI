import { ensurePrismaUser } from "../../../lib/auth";
import { getPlanSnapshot, getPlanUsageSummary } from "../../../lib/billing";
import { prisma } from "../../../lib/prisma";
import { BillingCard } from "../../../components/billing-card";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";
import { ReceiptText } from "lucide-react";

export default async function BillingPage() {
  const user = await ensurePrismaUser();
  const [snapshot, usage, payments] = await Promise.all([
    getPlanSnapshot(user.id),
    getPlanUsageSummary(user.id),
    prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  const nextRenewal = snapshot.currentPeriodEnd
    ? new Date(snapshot.currentPeriodEnd).toLocaleDateString()
    : null;

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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Invoices</h2>
          <Badge variant="default">{payments.length} total</Badge>
        </div>
        <div className="space-y-2">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-700">
              <ReceiptText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No invoices yet. Upgrade to Pro to start billing.</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {payment.stripePaymentId ?? payment.id}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    ${(payment.amount / 100).toFixed(2)}
                  </p>
                  <Badge variant="success">{payment.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
