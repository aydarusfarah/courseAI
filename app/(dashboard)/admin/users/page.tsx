import type { Metadata } from "next";
import { format } from "date-fns";
import { getAdminUsers } from "../../../../lib/admin";
import Link from "next/link";
import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";
import { Table, TableHeader, TableRow, TableCell } from "../../../../components/ui/table";
import AdminUserActions from "../../../../components/admin/user-actions";

export const metadata: Metadata = {
  title: "Admin Users | CourseAI"
};

export default async function AdminUsersPage(props: { searchParams?: Record<string, string | undefined> }) {
  const searchParams = props?.searchParams ?? {};
  const pageNum = Number(searchParams?.page ?? "1");
  const { users, total, page, perPage } = await getAdminUsers({ page: pageNum, perPage: 50, search: searchParams?.search });

  return (
    <div className="space-y-8">
      <SectionHeader title="Users" description="View and manage platform users, roles, and account statuses." />
      <Card>
        <form method="get" className="mb-4 flex gap-2">
          <input name="search" defaultValue={searchParams?.search ?? ""} placeholder="Search users" className="w-full rounded-md border px-3 py-2" />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-white">Search</button>
        </form>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name ?? user.email}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.suspended ? "Suspended" : "Active"}</TableCell>
                <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  <AdminUserActions userId={user.id} suspended={user.suspended} role={user.role} />
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} of {total}</div>
          <div className="flex gap-2">
            <Link href={`/admin/users?page=${Math.max(1, page - 1)}`} className="rounded-md border px-3 py-1">Prev</Link>
            <Link href={`/admin/users?page=${page + 1}`} className="rounded-md border px-3 py-1">Next</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
