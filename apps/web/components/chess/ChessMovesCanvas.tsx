"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { recordCompletion } from "@cognitive/utils";
import type { LevelSchema } from "@cognitive/content-schema";
import { PIECE_DATA, MOVE_DATA, type PieceName } from "./pieceData";

interface Props {
  level: LevelSchema;
  nextHref: string | null;
  worldHref: string;
}

const CELL = 52;

export function ChessMovesCanvas({ level, nextHref, worldHref }: Props) {
  const router = useRouter();
  const piece = (level.meta as unknown as { piece: PieceName }).piece;
  const pieceInfo = PIECE_DATA[piece];
  const moveInfo = MOVE_DATA[piece];

  const [playerPos, setPlayerPos] = useState(moveInfo.startPos);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [done, setDone] = useState(false);
  const cancelRef = useRef(false);
  const { boardSize, steps, validSquares } = moveInfo;

  const validSet = new Set(validSquares.map((s) => `${s.x},${s.y}`));

  const runAnimation = useCallback(async () => {
    if (isPlaying) return;
    cancelRef.current = false;
    setIsPlaying(true);
    setPlayerPos(moveInfo.startPos);

    for (let i = 0; i < steps.length; i++) {
      if (cancelRef.current) break;
      setActiveStep(i);
      await new Promise<void>((r) => setTimeout(r, 500));
      setPlayerPos(steps[i]!.to);
      await new Promise<void>((r) => setTimeout(r, 600));
    }

    setActiveStep(null);
    setIsPlaying(false);
    setPlayed(true);
    if (!cancelRef.current) setPlayerPos(moveInfo.startPos);
  }, [isPlaying, moveInfo, steps]);

  // auto-play on mount
  useEffect(() => {
    const t = setTimeout(() => runAnimation(), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = () => {
    recordCompletion(level.id, 3, 60);
    setDone(true);
    setTimeout(() => router.push(nextHref ?? worldHref), 700);
  };

  const isPlayer = (x: number, y: number) => playerPos.x === x && playerPos.y === y;
  const isStart = (x: number, y: number) =>
    moveInfo.startPos.x === x && moveInfo.startPos.y === y;
  const isValid = (x: number, y: number) => validSet.has(`${x},${y}`);

  return (
    <div style={{ fontFamily: "Nunito, system-ui, sans-serif", maxWidth: 560, margin: "0 auto", padding: "0.5rem" }}>

      {/* Header */}
      <div style={{
        background: pieceInfo.gradient,
        borderRadius: "1.25rem",
        padding: "1rem 1.25rem",
        color: "white",
        marginBottom: "1rem",
        display: "flex", alignItems: "center", gap: "0.875rem",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "0.875rem",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, flexShrink: 0,
        }}>
          {pieceInfo.symbol}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>Nasıl hareket eder</div>
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900 }}>{pieceInfo.name}</h2>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{moveInfo.ruleTitle}</div>
        </div>
      </div>

      {/* Board */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${boardSize}, ${CELL}px)`,
            gridTemplateRows: `repeat(${boardSize}, ${CELL}px)`,
            border: "3px solid #1e293b",
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
          }}>
            {Array.from({ length: boardSize * boardSize }, (_, i) => {
              const x = i % boardSize;
              const y = Math.floor(i / boardSize);
              const isLight = (x + y) % 2 === 0;
              const valid = isValid(x, y);
              const start = isStart(x, y) && !isPlayer(x, y);

              let bg = isLight ? "#f0d9b5" : "#b58863";
              if (valid) bg = isLight ? "#cef264" : "#aee14d";
              if (start) bg = isLight ? "#fde68a" : "#f59e0b";

              return (
                <div key={i} style={{
                  width: CELL, height: CELL,
                  background: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  color: valid ? "#166534" : "transparent",
                  transition: "background 0.2s",
                  position: "relative",
                }}>
                  {valid && !isPlayer(x, y) && (
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%",
                      background: "rgba(22,101,52,0.5)",
                    }} />
                  )}
                  {start && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#92400e", opacity: 0.4 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Animated piece */}
          <div style={{
            position: "absolute",
            width: CELL, height: CELL,
            top: playerPos.y * CELL,
            left: playerPos.x * CELL,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30,
            transition: isPlaying ? "top 0.45s cubic-bezier(.4,0,.2,1), left 0.45s cubic-bezier(.4,0,.2,1)" : "none",
            pointerEvents: "none",
            zIndex: 10,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
          }}>
            <span style={{
              display: "block",
              animation: isPlaying ? "chessBounce 0.5s ease-in-out infinite alternate" : "none",
            }}>
              {pieceInfo.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Step label */}
      <div style={{
        textAlign: "center", minHeight: 28, marginBottom: "0.75rem",
        fontWeight: 700, color: "#7c3aed", fontSize: 14,
        transition: "opacity 0.2s",
        opacity: activeStep !== null ? 1 : 0,
      }}>
        {activeStep !== null && steps[activeStep]
          ? `Step ${activeStep + 1}: ${steps[activeStep]!.label}`
          : ""}
      </div>

      {/* Rules */}
      <div style={{
        background: "#f8fafc", border: "2px solid #e2e8f0",
        borderRadius: "1rem", padding: "0.875rem 1rem",
        marginBottom: "0.875rem",
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: "0.5rem" }}>
          📖 Rules
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {moveInfo.rules.map((rule, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: 13, fontWeight: 600, color: "#374151" }}>
              <span style={{ color: pieceInfo.color, fontSize: 16 }}>✓</span>
              {rule}
            </div>
          ))}
        </div>
        {moveInfo.specialNote && (
          <div style={{
            marginTop: "0.625rem",
            background: "linear-gradient(135deg, #fef9c3, #fef3c7)",
            borderRadius: "0.75rem", padding: "0.5rem 0.75rem",
            fontSize: 13, fontWeight: 700, color: "#92400e",
          }}>
            {moveInfo.specialNote}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button
          type="button"
          onClick={runAnimation}
          disabled={isPlaying}
          style={{
            padding: "0.75rem 1.5rem",
            background: isPlaying ? "#e2e8f0" : "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: isPlaying ? "#94a3b8" : "white",
            border: "none", borderRadius: "0.875rem",
            cursor: isPlaying ? "default" : "pointer",
            fontWeight: 800, fontSize: 14, minHeight: "44px",
            boxShadow: isPlaying ? "none" : "0 4px 14px rgba(99,102,241,0.4)",
          }}
        >
          {isPlaying ? "▶ Playing…" : "▶ Play Again"}
        </button>

        {played && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={done}
            style={{
              padding: "0.75rem 1.5rem",
              background: done ? "#86efac" : pieceInfo.gradient,
              color: "white", border: "none", borderRadius: "0.875rem",
              cursor: done ? "default" : "pointer",
              fontWeight: 800, fontSize: 14, minHeight: "44px",
              boxShadow: done ? "none" : "0 4px 14px rgba(0,0,0,0.2)",
              animation: done ? "none" : "pulseBtn 1.5s ease-in-out infinite",
            }}
          >
            {done ? "✅ Done!" : "I got it! →"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes chessBounce {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(-5px) scale(1.1); }
        }
        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
          50% { box-shadow: 0 4px 22px rgba(0,0,0,0.35); transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}
