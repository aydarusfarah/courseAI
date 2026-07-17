import type { Metadata } from "next";
import { format } from "date-fns";
import { getAdminPayments } from "../../../../lib/admin";
import Link from "next/link";
import PaymentActions from "../../../../components/admin/payment-actions";
import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";
import { Table, TableHeader, TableRow, TableCell } from "../../../../components/ui/table";

export const metadata: Metadata = {
  title: "Admin Payments | CourseAI"
};

export default async function AdminPaymentsPage(props: { searchParams?: Record<string, string | undefined> }) {
  const searchParams = props?.searchParams ?? {};
  const page = Number(searchParams?.page ?? "1");
  const { payments, total, page: currentPage, perPage } = await getAdminPayments({ page, perPage: 50, search: searchParams?.search });

  return (
    <div className="space-y-8">
      <SectionHeader title="Payments" description="Review payment history, transaction status, and transaction details." />
      <Card>
        <form method="get" className="mb-4 flex gap-2">
          <input name="search" defaultValue={searchParams?.search ?? ""} placeholder="Search payments" className="w-full rounded-md border px-3 py-2" />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-white">Search</button>
        </form>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Payment ID</TableHeader>
              <TableHeader>User</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.stripePaymentId ?? payment.id}</TableCell>
                <TableCell>{payment.user.name ?? payment.user.email}</TableCell>
                <TableCell>${(payment.amount / 100).toFixed(2)}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>{format(new Date(payment.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <PaymentActions paymentId={payment.id} />
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, total)} of {total}</div>
          <div className="flex gap-2">
            <Link href={`/admin/payments?page=${Math.max(1, currentPage - 1)}`} className="rounded-md border px-3 py-1">Prev</Link>
            <Link href={`/admin/payments?page=${currentPage + 1}`} className="rounded-md border px-3 py-1">Next</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
