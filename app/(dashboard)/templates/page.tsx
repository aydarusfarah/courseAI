import { ensurePrismaUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";
import { Badge } from "../../../components/ui/badge";
import Link from "next/link";

const DEFAULT_TEMPLATES = [
  { name: "Lesson plan", description: "A structured template for course lessons.", type: "LESSON" },
  { name: "Quiz builder", description: "Generate quizzes and exam-style questions.", type: "QUIZ" },
  { name: "Marketing page", description: "Create landing page copy for your course.", type: "MARKETING" }
];

export default async function TemplatesPage() {
  const user = await ensurePrismaUser();

  const dbTemplates = await prisma.promptTemplate.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 50
  });

  const templates = dbTemplates.length > 0
    ? dbTemplates.map((t) => ({ id: t.id, name: t.name, description: t.description ?? "", type: t.type }))
    : DEFAULT_TEMPLATES.map((t, i) => ({ id: String(i), ...t }));

  return (
    <div className="space-y-8">
      <SectionHeader title="Templates" description="Browse AI prompt templates for outlines, quizzes, slides, and marketing content." />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-950">{template.name}</h3>
              <Badge variant="default">{template.type.replace(/_/g, " ").toLowerCase()}</Badge>
            </div>
            <p className="text-sm text-slate-600">{template.description}</p>
            <Link
              href="/generator"
              className="inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Use template →
            </Link>
          </Card>
        ))}
      </div>
      {dbTemplates.length === 0 && (
        <p className="text-center text-sm text-slate-500">
          No saved templates yet. Admins can create custom prompt templates in{" "}
          <Link href="/admin/prompt-templates" className="text-brand-600 hover:underline">Admin → Prompt Templates</Link>.
        </p>
      )}
    </div>
  );
}

