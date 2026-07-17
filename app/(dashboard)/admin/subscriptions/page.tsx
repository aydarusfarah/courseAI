import type { Metadata } from "next";
import { format } from "date-fns";
import { getAdminSubscriptions } from "../../../../lib/admin";
import Link from "next/link";
import SubscriptionActions from "../../../../components/admin/subscription-actions";
import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";
import { Table, TableHeader, TableRow, TableCell } from "../../../../components/ui/table";

export const metadata: Metadata = {
  title: "Admin Subscriptions | CourseAI"
};

export default async function AdminSubscriptionsPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await (props.searchParams ?? Promise.resolve({} as { [key: string]: string | string[] | undefined }));
  const page = Number(resolvedParams?.page ?? "1");
  const { subscriptions, total, page: currentPage, perPage } = await getAdminSubscriptions({ page, perPage: 50, search: resolvedParams?.search as string | undefined });

  return (
    <div className="space-y-8">
      <SectionHeader title="Subscriptions" description="Track active plans, renewal dates, and subscription statuses." />
      <Card>
        <form method="get" className="mb-4 flex gap-2">
          <input name="search" defaultValue={resolvedParams?.search ?? ""} placeholder="Search subscriptions" className="w-full rounded-md border px-3 py-2" />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-white">Search</button>
        </form>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>User</TableHeader>
              <TableHeader>Plan</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Renewal</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.user.name ?? subscription.user.email}</TableCell>
                  <TableCell>{subscription.priceId ?? subscription.stripeId ?? "—"}</TableCell>
                  <TableCell>{subscription.status}</TableCell>
                  <TableCell>{subscription.cancelAt ? format(new Date(subscription.cancelAt), "MMM d, yyyy") : "N/A"}</TableCell>
                  <TableCell>
                    <SubscriptionActions subscriptionId={subscription.id} cancelAt={subscription.cancelAt} />
                  </TableCell>
                </TableRow>
            ))}
          </tbody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, total)} of {total}</div>
          <div className="flex gap-2">
            <Link href={`/admin/subscriptions?page=${Math.max(1, currentPage - 1)}`} className="rounded-md border px-3 py-1">Prev</Link>
            <Link href={`/admin/subscriptions?page=${currentPage + 1}`} className="rounded-md border px-3 py-1">Next</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
