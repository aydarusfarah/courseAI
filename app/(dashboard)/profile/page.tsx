import { Card } from "../../../components/card";
import { SectionHeader } from "../../../components/section-header";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Profile" description="View and edit your account profile, contact information, and preferences." />
      <Card className="space-y-5">
        <p className="text-sm text-slate-600">Profile details and account management will be available here.</p>
      </Card>
    </div>
  );
}
