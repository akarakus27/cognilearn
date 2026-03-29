"use client";

import { useEffect } from "react";
import { playSound } from "@/lib/sound";

interface FailFeedbackProps {
  onRetry: () => void;
}

export function FailFeedback({ onRetry }: FailFeedbackProps) {
  useEffect(() => {
    playSound("fail");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") { e.preventDefault(); onRetry(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRetry]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        fontFamily: "Nunito, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
        borderRadius: "1.5rem",
        border: "2px solid #fecdd3",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120,
        background: "rgba(251,113,133,0.15)", borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute", bottom: -20, left: -20,
        width: 90, height: 90,
        background: "rgba(251,113,133,0.1)", borderRadius: "50%",
      }} />

      {/* Emoji */}
      <div style={{ fontSize: 64, marginBottom: "0.75rem", lineHeight: 1 }}>
        😅
      </div>

      {/* Title */}
      <h2 style={{
        margin: "0 0 0.5rem",
        fontSize: "clamp(1.4rem, 4vw, 1.75rem)",
        fontWeight: 900,
        color: "#be123c",
        letterSpacing: "-0.02em",
      }}>
        Not quite!
      </h2>

      {/* Subtitle */}
      <p style={{
        color: "#9f1239",
        fontSize: 15,
        fontWeight: 600,
        marginBottom: "0.25rem",
        opacity: 0.8,
      }}>
        The path didn&apos;t lead to the star ⭐
      </p>
      <p style={{
        color: "#fb7185",
        fontSize: 13,
        fontWeight: 700,
        marginBottom: "2rem",
        background: "rgba(255,255,255,0.6)",
        padding: "0.35rem 0.875rem",
        borderRadius: "9999px",
        display: "inline-block",
      }}>
        No penalty — just try again! 🚀
      </p>

      {/* Try Again button */}
      <button
        type="button"
        onClick={onRetry}
        aria-label="Try the level again"
        style={{
          padding: "0.85rem 2.5rem",
          background: "linear-gradient(135deg, #f43f5e, #e11d48)",
          color: "white",
          border: "none",
          borderRadius: "1rem",
          cursor: "pointer",
          fontWeight: 900,
          fontSize: 17,
          minHeight: "52px",
          boxShadow: "0 6px 20px rgba(244,63,94,0.45)",
          transition: "transform 0.15s, box-shadow 0.15s",
          letterSpacing: "0.01em",
          position: "relative",
          zIndex: 1,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(244,63,94,0.55)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(244,63,94,0.45)";
        }}
      >
        🔄 Try Again
      </button>

      <p style={{ marginTop: "0.875rem", fontSize: 12, color: "#fda4af", fontWeight: 600 }}>
        or press <kbd style={{
          background: "white", border: "1px solid #fecdd3",
          borderRadius: "0.25rem", padding: "1px 6px", fontSize: 11,
          color: "#be123c", fontFamily: "monospace",
        }}>Enter</kbd>
      </p>
    </div>
  );
}
