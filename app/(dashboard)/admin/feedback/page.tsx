import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ensurePrismaUser } from "../../../../lib/auth";
import { getFeedbackList } from "../../../../lib/admin";
import { SectionHeader } from "../../../../components/section-header";
import FeedbackManager from "../../../../components/admin/feedback-manager";

export const metadata: Metadata = { title: "Feedback | Admin" };

export default async function AdminFeedbackPage(props: {
  searchParams?: Promise<{ status?: string; page?: string }>;
}) {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") redirect("/admin/forbidden" as const);

  const searchParams = await (props.searchParams ?? Promise.resolve({} as { status?: string; page?: string }));
  const status = searchParams?.status;
  const page = Number(searchParams?.page ?? "1");

  const { feedback, total, perPage } = await getFeedbackList({ status, page, perPage: 20 });

  return (
    <div className="space-y-8">
      <SectionHeader title="User Feedback" description="Review, respond to, resolve, and archive user-submitted feedback." />
      <FeedbackManager initialFeedback={feedback} total={total} page={page} perPage={perPage} currentStatus={status ?? "all"} />
    </div>
  );
}
