import type { Metadata } from "next";
import "./globals.css";

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
        <a
          href="#main-content"
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            padding: "0.5rem 0.75rem",
            background: "#111827",
            color: "white",
            borderRadius: "0.5rem",
            transform: "translateY(-200%)",
            zIndex: 1000,
          }}
          onFocus={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.transform = "translateY(-200%)";
          }}
        >
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
