import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Settings" description="Manage your profile, account preferences, and application settings." />
      <Card className="space-y-5">
        <p className="text-sm text-slate-600">Settings will help you configure your application environment and preferences.</p>
      </Card>
    </div>
  );
}
