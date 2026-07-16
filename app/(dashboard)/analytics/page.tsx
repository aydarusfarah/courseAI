import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Analytics" description="Track performance, engagement, and AI usage across your courses." />
      <Card className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-950">Audience engagement</h3>
        <p className="text-sm text-slate-600">Analytics charts will populate as you publish course content and gather user data.</p>
      </Card>
    </div>
  );
}
