"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { playSound } from "@/lib/sound";

interface SuccessFeedbackProps {
  stars: 1 | 2 | 3;
  xp: number;
  nextLevelHref: string | null;
  worldHref: string;
  onRetry?: () => void;
}

export function SuccessFeedback({ stars, xp, nextLevelHref, worldHref, onRetry }: SuccessFeedbackProps) {
  const router = useRouter();

  useEffect(() => {
    playSound("success");
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      router.push(nextLevelHref ?? worldHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextLevelHref, worldHref, router]);

  const starDisplay = ["⭐", "⭐⭐", "⭐⭐⭐"][stars - 1];

  const confettiItems = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 4.5 + 2) % 100}%`,
    color: ["#f59e0b","#6366f1","#22c55e","#ec4899","#3b82f6","#f97316","#a855f7"][i % 7]!,
    delay: `${(i * 0.06).toFixed(2)}s`,
    duration: `${0.9 + (i % 5) * 0.18}s`,
    size: `${6 + (i % 4) * 3}px`,
  }));

  const starMessages = [
    "İyi iş! Daha iyi yapabilirsin 💪",
    "Harika! Neredeyse mükemmel! 🌟",
    "Mükemmel! Tam puan! 🏆",
  ];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #1e3a5f 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Nunito, system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
      padding: "2rem 1rem",
    }}>
      {/* Animated background circles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[
          { size: 300, top: "-80px", left: "-80px", color: "rgba(139,92,246,0.15)" },
          { size: 250, bottom: "-60px", right: "-60px", color: "rgba(99,102,241,0.12)" },
          { size: 180, top: "40%", right: "10%", color: "rgba(236,72,153,0.1)" },
          { size: 120, top: "20%", left: "5%", color: "rgba(245,158,11,0.08)" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            width: b.size, height: b.size,
            borderRadius: "50%",
            background: b.color,
            top: b.top, bottom: b.bottom,
            left: b.left, right: b.right,
            filter: "blur(40px)",
          }} />
        ))}
      </div>

      {/* Confetti */}
      {confettiItems.map((c) => (
        <div key={c.id} style={{
          position: "absolute",
          top: "-10px",
          left: c.left,
          width: c.size,
          height: c.size,
          background: c.color,
          borderRadius: c.id % 3 === 0 ? "50%" : "2px",
          animation: `confettiFall ${c.duration} ${c.delay} ease-in forwards`,
          zIndex: 1,
        } as React.CSSProperties} />
      ))}

      {/* Card */}
      <div style={{
        position: "relative",
        zIndex: 2,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255,255,255,0.15)",
        borderRadius: "2rem",
        padding: "2.5rem 2rem",
        maxWidth: 420,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
      }}>
        {/* Trophy */}
        <div style={{
          fontSize: 80, marginBottom: "0.75rem", lineHeight: 1,
          animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both",
        }}>
          🏆
        </div>

        <h2 style={{
          color: "white", fontSize: "clamp(1.5rem, 4vw, 2rem)",
          fontWeight: 900, marginBottom: "0.25rem",
          textShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}>
          Tebrikler! 🎉
        </h2>

        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: "1.25rem", fontWeight: 600 }}>
          {starMessages[stars - 1]}
        </p>

        {/* Stars */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "0.35rem",
          marginBottom: "0.75rem",
        }}>
          {[1, 2, 3].map((i) => (
            <span key={i} style={{
              fontSize: 40,
              filter: i <= stars ? "drop-shadow(0 0 8px #f59e0b)" : "grayscale(1) opacity(0.3)",
              animation: i <= stars ? `starPop 0.4s ${i * 0.15}s cubic-bezier(0.175,0.885,0.32,1.275) both` : "none",
            }}>⭐</span>
          ))}
        </div>

        {/* XP */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          borderRadius: "2rem", padding: "0.5rem 1.5rem",
          fontSize: 18, fontWeight: 900, color: "white",
          marginBottom: "2rem",
          boxShadow: "0 4px 20px rgba(245,158,11,0.5)",
        }}>
          ⚡ +{xp} XP
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {nextLevelHref && (
            <Link href={nextLevelHref} aria-label="Go to the next level" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              padding: "0.95rem 2rem",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white", borderRadius: "1.25rem",
              textDecoration: "none", fontWeight: 800, fontSize: 17,
              boxShadow: "0 6px 20px rgba(124,58,237,0.5)",
              transition: "transform 0.15s",
            }}>
              🚀 Sonraki Bölüm
            </Link>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              aria-label="Retry this level"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.85rem 2rem",
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                color: "white", borderRadius: "1.25rem",
                cursor: "pointer", fontWeight: 700, fontSize: 15,
              }}
            >
              🔄 Tekrar Oyna
            </button>
          )}

          <Link href={worldHref} aria-label="Return to the world map" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "0.85rem 2rem",
            background: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.85)", borderRadius: "1.25rem",
            textDecoration: "none", fontWeight: 700, fontSize: 15,
          }}>
            🗺️ Dünya Haritası
          </Link>

          <Link href="/" aria-label="Return to the home page" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "0.75rem 2rem",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none", fontWeight: 600, fontSize: 13,
          }}>
            🏠 Ana Sayfa
          </Link>
        </div>

        <p style={{ marginTop: "1rem", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
          Enter tuşu ile devam et
        </p>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes starPop {
          0%   { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
