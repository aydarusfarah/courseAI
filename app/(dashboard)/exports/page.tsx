import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";

export default function ExportsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Exports" description="Manage your course exports, downloads, and content package delivery." />
      <Card className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <p className="text-sm text-slate-600">Export options will appear here once you’ve generated course content.</p>
      </Card>
    </div>
  );
}
