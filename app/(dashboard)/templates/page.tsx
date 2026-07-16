import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";

const templates = [
  { name: "Lesson plan", description: "A structured template for course lessons." },
  { name: "Quiz builder", description: "Generate quizzes and exam-style questions." },
  { name: "Marketing page", description: "Create landing page copy for your course." }
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Templates" description="Browse AI prompt templates for outlines, quizzes, slides, and marketing content." />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.name} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-950">{template.name}</h3>
            <p className="text-sm text-slate-600">{template.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
