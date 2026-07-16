import type { Metadata } from "next";
import { ClerkProviderRoot } from "../../components/clerk-provider";
import "../globals.css";

export const metadata: Metadata = {
  title: "CourseAI — AI Course Generator",
  description: "Generate professional online courses with AI.",
  metadataBase: new URL("https://courseai.app")
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProviderRoot>{children}</ClerkProviderRoot>;
}
