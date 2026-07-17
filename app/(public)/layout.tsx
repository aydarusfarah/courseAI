import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CourseAI — AI Course Generator",
  description: "Generate professional online courses with AI.",
  metadataBase: new URL("https://courseai.app")
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
