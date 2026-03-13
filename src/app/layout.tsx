import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";

export const metadata: Metadata = {
  title: "DevPath – Learning Roadmap Platform FILKOM UB",
  description:
    "Interactive learning roadmap platform untuk mahasiswa FILKOM Universitas Brawijaya. Temukan jalur belajar yang tepat untuk karirmu.",
  keywords: ["FILKOM", "UB", "Brawijaya", "learning roadmap", "programming path", "IT career"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-surface-secondary">
        <TopNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
