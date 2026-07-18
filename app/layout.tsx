import type { Metadata } from "next";
import { ClerkProviderRoot } from "../components/clerk-provider";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CourseAI — AI Course Generator",
  description: "Generate professional online courses with AI.",
  metadataBase: new URL("https://courseai.app")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProviderRoot>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProviderRoot>
      </body>
    </html>
  );
}
