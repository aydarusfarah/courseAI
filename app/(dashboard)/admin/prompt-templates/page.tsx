import type { Metadata } from "next";
import { getAdminPromptTemplates } from "../../../../lib/admin";
import { ensurePrismaUser } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import { SectionHeader } from "../../../../components/section-header";
import PromptTemplateManager from "../../../../components/admin/prompt-template-manager";

export const metadata: Metadata = { title: "Prompt Templates | Admin" };

export default async function AdminPromptTemplatesPage(props: { searchParams?: Promise<{ search?: string; status?: string }> }) {
  const user = await ensurePrismaUser();
  if (user.role !== "ADMIN") redirect("/admin/forbidden" as const);

  const searchParams = await (props.searchParams ?? Promise.resolve({} as { search?: string; status?: string }));
  const search = searchParams?.search;
  const status = searchParams?.status;

  const templates = await getAdminPromptTemplates({ search, status });

  return (
    <div className="space-y-8">
      <SectionHeader title="Prompt Templates" description="Create, edit, enable, disable, and duplicate AI prompt templates." />
      <PromptTemplateManager initialTemplates={templates} adminId={user.id} />
    </div>
  );
}
