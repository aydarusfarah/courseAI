import type { Metadata } from "next";
import { DashboardShell } from "../../components/dashboard-shell";

export const metadata: Metadata = {
  title: "CourseAI Dashboard",
  description: "Manage your courses, AI workflows, exports, billing, and analytics."
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
