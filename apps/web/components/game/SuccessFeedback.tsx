"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SuccessFeedbackProps {
  stars: 1 | 2 | 3;
  xp: number;
  nextLevelHref: string | null;
  worldHref: string;
}

export function SuccessFeedback({ stars, xp, nextLevelHref, worldHref }: SuccessFeedbackProps) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      router.push(nextLevelHref ?? worldHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextLevelHref, worldHref, router]);

  const starDisplay = ["⭐", "⭐⭐", "⭐⭐⭐"][stars - 1];

  return (
    <div className="success-feedback" style={{
      textAlign: "center",
      padding: "2rem 1rem",
      fontFamily: "Nunito, system-ui, sans-serif",
    }}>
      {/* Animated star */}
      <div className="success-pop" style={{ fontSize: 72, marginBottom: "0.75rem", lineHeight: 1 }}>
        🏆
      </div>

      <h2 style={{
        color: "#15803d", fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
        fontWeight: 900, marginBottom: "0.5rem",
      }}>
        Harika! Tebrikler! 🎉
      </h2>

      {/* Stars */}
      <div style={{ fontSize: 36, marginBottom: "0.5rem" }}>{starDisplay}</div>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: "0.25rem" }}>
        {stars} yıldız kazandın!
      </p>

      {/* XP */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
        border: "2px solid #f59e0b",
        borderRadius: "2rem", padding: "0.4rem 1.25rem",
        fontSize: 16, fontWeight: 800, color: "#92400e",
        marginBottom: "2rem",
      }}>
        ⚡ +{xp} XP
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
        {nextLevelHref && (
          <Link href={nextLevelHref} style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.875rem 2rem",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white", borderRadius: "1rem",
            textDecoration: "none", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
          }}>
            Sonraki Bölüm →
          </Link>
        )}
        <Link href={worldHref} style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.875rem 1.5rem",
          background: "white", border: "2px solid #e2e8f0",
          color: "#475569", borderRadius: "1rem",
          textDecoration: "none", fontWeight: 700, fontSize: 15,
        }}>
          🗺️ Dünya Haritası
        </Link>
      </div>
    </div>
  );
}
