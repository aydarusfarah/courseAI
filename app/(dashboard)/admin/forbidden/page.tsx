import { Card } from "../../../../components/card";
import { SectionHeader } from "../../../../components/section-header";

export default function AdminForbiddenPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Access denied" description="You do not have permission to view this page." />
      <Card className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <h2 className="text-xl font-semibold text-slate-950">Administrator access required</h2>
        <p className="mt-4 text-sm text-slate-600">
          This section is restricted to admin users. Please contact your administrator if you believe this is an error.
        </p>
      </Card>
    </div>
  );
}
