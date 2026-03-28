import Link from "next/link";
import { ProgressCodeForm } from "@/components/settings/ProgressCodeForm";

export default function SettingsPage() {
  return (
    <main className="app-shell">
      <Link href="/" style={{ fontSize: 14, color: "#666", marginBottom: "1rem", display: "block" }}>
        ← Home
      </Link>
      <h1 style={{ fontSize: "clamp(1.35rem, 4vw, 1.75rem)" }}>Settings</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Your progress is stored on this device. Use a progress code to share or restore it.
      </p>
      <ProgressCodeForm />
    </main>
  );
}
