import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "./SkipLink";

export const metadata: Metadata = {
  title: "Cognitive Learning Platform",
  description: "Lifelong cognitive development for ages 6–12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <SkipLink />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
