"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordCompletion } from "@cognitive/utils";
import type { LevelSchema } from "@cognitive/content-schema";
import { PIECE_DATA, type PieceName } from "./pieceData";

interface Props {
  level: LevelSchema;
  nextHref: string | null;
  worldHref: string;
}

const CELL = 36;

function MiniBoard({ piece }: { piece: PieceName }) {
  const data = PIECE_DATA[piece];
  const startSet = new Set(data.startSquares.map((s) => `${s.x},${s.y}`));

  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(8, ${CELL}px)`,
        gridTemplateRows: `repeat(8, ${CELL}px)`,
        border: "3px solid #1e293b",
        borderRadius: "0.5rem",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      {Array.from({ length: 64 }, (_, i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const isLight = (x + y) % 2 === 0;
        const isStart = startSet.has(`${x},${y}`);
        return (
          <div
            key={i}
            style={{
              width: CELL, height: CELL,
              background: isStart
                ? data.color
                : isLight ? "#f0d9b5" : "#b58863",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              transition: "background 0.3s",
              boxShadow: isStart ? "inset 0 0 0 2px rgba(255,255,255,0.5)" : "none",
            }}
          >
            {isStart && (
              <span style={{ color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.6)", userSelect: "none" }}>
                {data.symbol}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ChessLessonCanvas({ level, nextHref, worldHref }: Props) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  const piece = (level.meta as { piece: PieceName }).piece;
  const data = PIECE_DATA[piece];

  const handleComplete = () => {
    recordCompletion(level.id, 3, 60);
    setDone(true);
    setTimeout(() => {
      router.push(nextHref ?? worldHref);
    }, 800);
  };

  return (
    <div
      style={{
        fontFamily: "Nunito, system-ui, sans-serif",
        maxWidth: 560,
        margin: "0 auto",
        padding: "0.5rem",
      }}
    >
      {/* Piece header */}
      <div
        style={{
          background: data.gradient,
          borderRadius: "1.5rem",
          padding: "1.5rem",
          color: "white",
          marginBottom: "1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* bg dots */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 8, height: 8, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            left: `${(i * 23 + 5) % 90}%`,
            top: `${(i * 31 + 10) % 80}%`,
          }} />
        ))}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "1rem",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, flexShrink: 0,
          }}>
            {data.symbol}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, marginBottom: 2 }}>
              {data.emoji} {data.nickname}
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(1.4rem,4vw,1.8rem)", fontWeight: 900 }}>
              {data.name}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
              {data.description}
            </p>
          </div>
        </div>
      </div>

      {/* Board + Facts side by side on desktop */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {/* Mini board */}
        <div style={{ flex: "0 0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: "0.4rem", textAlign: "center" }}>
            Starting position
          </div>
          <MiniBoard piece={piece} />
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: "0.35rem", textAlign: "center" }}>
            {data.startSquares.length === 1 ? "1 piece" : `${data.startSquares.length} pieces`} on the board
          </div>
        </div>

        {/* Facts */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: "0.6rem" }}>
            📌 Key Facts
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.facts.map((fact, i) => (
              <div key={i} style={{
                display: "flex", gap: "0.5rem", alignItems: "flex-start",
                background: "#f8fafc", borderRadius: "0.75rem",
                padding: "0.625rem 0.75rem",
                border: "1.5px solid #e2e8f0",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: data.gradient, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", lineHeight: 1.4 }}>
                  {fact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fun fact */}
      <div style={{
        background: "linear-gradient(135deg, #fef9c3, #fef3c7)",
        border: "2px solid #fde68a",
        borderRadius: "1rem",
        padding: "0.875rem 1rem",
        fontSize: 14, fontWeight: 700, color: "#92400e",
        marginBottom: "1.5rem",
      }}>
        {data.funFact}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={handleComplete}
          disabled={done}
          style={{
            padding: "0.875rem 2.5rem",
            background: done ? "#86efac" : data.gradient,
            color: "white", border: "none", borderRadius: "1rem",
            cursor: done ? "default" : "pointer",
            fontWeight: 900, fontSize: 17,
            boxShadow: done ? "none" : "0 6px 20px rgba(0,0,0,0.2)",
            transition: "all 0.2s",
            minWidth: 200,
          }}
        >
          {done ? "✅ Got it!" : "Got it! →"}
        </button>
        <div style={{ marginTop: "0.5rem", fontSize: 12, color: "#94a3b8" }}>
          Next: {nextHref ? "next lesson" : "back to world"}
        </div>
      </div>
    </div>
  );
}
