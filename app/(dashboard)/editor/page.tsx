import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";

export default function EditorPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Course Editor" description="Edit your course content, manage lessons, and refine course details in one workspace." />
      <Card className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm font-semibold text-slate-900">Editor workspace</p>
          <p className="mt-2 text-sm text-slate-600">Placeholder for the course editor interface while rich editing is prepared.</p>
        </div>
      </Card>
    </div>
  );
}
