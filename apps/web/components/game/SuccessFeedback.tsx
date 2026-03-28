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

export function SuccessFeedback({
  stars,
  xp,
  nextLevelHref,
  worldHref,
}: SuccessFeedbackProps) {
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

  return (
    <div className="success-feedback" style={{ textAlign: "center", padding: "1rem" }}>
      <div
        className="success-pop"
        style={{
          fontSize: "clamp(2rem, 8vw, 3rem)",
          marginBottom: "0.5rem",
        }}
      >
        ★
      </div>
      <h2 style={{ color: "#15803d", marginBottom: "0.25rem" }}>Great job!</h2>
      <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        {"★".repeat(stars)} <span style={{ color: "#666", fontSize: "0.95rem" }}>({stars} stars)</span>
      </p>
      <p style={{ color: "#666", marginBottom: "1rem" }}>+{xp} XP</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
        {nextLevelHref && (
          <Link
            href={nextLevelHref}
            style={{
              display: "inline-block",
              padding: "0.65rem 1.25rem",
              background: "#2563eb",
              color: "white",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600,
              minHeight: "44px",
              lineHeight: 1.2,
            }}
          >
            Next level
          </Link>
        )}
        <Link
          href={worldHref}
          style={{
            display: "inline-block",
            padding: "0.65rem 1.25rem",
            background: "#f3f4f6",
            color: "#111827",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: 600,
            minHeight: "44px",
            lineHeight: 1.2,
          }}
        >
          World map
        </Link>
      </div>
    </div>
  );
}
