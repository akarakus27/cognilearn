"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { computeReward } from "@cognitive/game-engine";
import type { EngineState, GridCommand, Action } from "@cognitive/game-engine";
import { SuccessFeedback } from "./SuccessFeedback";
import { FailFeedback } from "./FailFeedback";
import { playSound } from "@/lib/sound";

const ARROW: Record<GridCommand, string> = {
  UP: "⬆️",
  DOWN: "⬇️",
  LEFT: "⬅️",
  RIGHT: "➡️",
};

const DELTA: Record<GridCommand, { dx: number; dy: number }> = {
  UP:    { dx: 0, dy: -1 },
  DOWN:  { dx: 0, dy:  1 },
  LEFT:  { dx: -1, dy: 0 },
  RIGHT: { dx:  1, dy: 0 },
};

interface AnimPos { x: number; y: number }

interface SequenceCanvasProps {
  state: EngineState;
  onAction: (action: Action) => void;
  worldId: string;
  levelId: string;
  nextLevelHref: string | null;
}

export function SequenceCanvas({
  state,
  onAction,
  worldId,
  levelId,
  nextLevelHref,
}: SequenceCanvasProps) {
  const { level, grid, phase, commandHistory } = state;
  const [queue, setQueue] = useState<GridCommand[]>([]);
  const [animPos, setAnimPos] = useState<AnimPos | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);

  const cellSize = 56;

  const handleRun = useCallback(async () => {
    if (!grid || queue.length === 0) return;

    cancelRef.current = false;
    setIsPlaying(true);

    let pos = { x: grid.position.x, y: grid.position.y };
    setAnimPos(pos);

    const obstacles: Array<{ x: number; y: number }> = grid.obstacles ?? [];

    for (let i = 0; i < queue.length; i++) {
      if (cancelRef.current) break;
      setActiveStep(i);

      const cmd = queue[i]!;
      const { dx, dy } = DELTA[cmd];
      const next = { x: pos.x + dx, y: pos.y + dy };

      // Block if out of bounds or obstacle — stay in place
      const blocked =
        next.x < 0 || next.x >= grid.cols ||
        next.y < 0 || next.y >= grid.rows ||
        obstacles.some((o) => o.x === next.x && o.y === next.y);

      if (!blocked) {
        pos = next;
        setAnimPos({ ...pos });
      }
      // If blocked, still wait so the user sees the pause

      playSound("step");
      await new Promise<void>((r) => setTimeout(r, 380));
    }

    setActiveStep(null);
    setIsPlaying(false);
    setAnimPos(null);

    if (!cancelRef.current) {
      onAction({ type: "RUN_SEQUENCE", commands: queue });
      setQueue([]);
    }
  }, [grid, queue, onAction]);

  const handleCancel = () => {
    cancelRef.current = true;
    setIsPlaying(false);
    setAnimPos(null);
    setActiveStep(null);
  };

  if (!level) return <p>No level loaded</p>;

  if (phase === "intro") {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧩</div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#1e293b" }}>
          {level.learning_goal}
        </h3>
        <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: 14 }}>
          {level.expected_behavior}
        </p>
        <button
          type="button"
          onClick={() => { setQueue([]); onAction({ type: "START_LEVEL" }); }}
          style={{
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white", border: "none", borderRadius: "1rem",
            cursor: "pointer", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
          }}
        >
          🚀 Let's Go!
        </button>
      </div>
    );
  }

  if (phase === "success" && level) {
    const r = computeReward(level, commandHistory);
    return (
      <SuccessFeedback
        stars={r.stars}
        xp={r.xp}
        nextLevelHref={nextLevelHref}
        worldHref={`/world/${worldId}`}
      />
    );
  }

  if (phase === "fail") {
    return (
      <FailFeedback
        onRetry={() => { setQueue([]); setAnimPos(null); onAction({ type: "RETRY" }); }}
      />
    );
  }

  if (!grid) return <p>No grid</p>;

  const displayPos = animPos ?? grid.position;
  const isObstacle = (x: number, y: number) =>
    (grid.obstacles ?? []).some((o) => o.x === x && o.y === y);
  const isGoal = (x: number, y: number) => grid.goal.x === x && grid.goal.y === y;

  return (
    <div style={{ padding: "0.5rem", fontFamily: "Nunito, sans-serif", maxWidth: 480, margin: "0 auto" }}>

      {/* Grid */}
      <div style={{ position: "relative", width: grid.cols * cellSize, margin: "0 auto 1.25rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${grid.rows}, ${cellSize}px)`,
            border: "2px solid #e2e8f0",
            borderRadius: "0.75rem",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: grid.rows * grid.cols }, (_, i) => {
            const x = i % grid.cols;
            const y = Math.floor(i / grid.cols);
            const goal = isGoal(x, y);
            const obstacle = isObstacle(x, y);
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: obstacle ? "#475569" : goal ? "#dcfce7" : (x + y) % 2 === 0 ? "#f8fafc" : "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  position: "relative",
                }}
              >
                {goal && !obstacle && <span style={{ fontSize: 26 }}>⭐</span>}
                {obstacle && <span style={{ fontSize: 22 }}>🧱</span>}
              </div>
            );
          })}
        </div>

        {/* Animated player */}
        <div
          style={{
            position: "absolute",
            width: cellSize,
            height: cellSize,
            top: displayPos.y * cellSize,
            left: displayPos.x * cellSize,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            transition: isPlaying ? "top 0.32s cubic-bezier(.4,0,.2,1), left 0.32s cubic-bezier(.4,0,.2,1)" : "none",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <span
            style={{
              display: "block",
              animation: isPlaying ? "bounce 0.38s ease-in-out infinite alternate" : "none",
            }}
          >
            🤖
          </span>
        </div>
      </div>

      {/* Command buttons */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
        {(["UP", "DOWN", "LEFT", "RIGHT"] as GridCommand[]).map((cmd) => (
          <button
            key={cmd}
            type="button"
            disabled={isPlaying}
            onClick={() => { playSound("click"); setQueue((q) => [...q, cmd]); }}
            style={{
              width: 56, height: 56, fontSize: 24,
              background: isPlaying ? "#f1f5f9" : "white",
              border: "2px solid #e2e8f0",
              borderRadius: "0.75rem",
              cursor: isPlaying ? "default" : "pointer",
              fontWeight: 700,
              boxShadow: isPlaying ? "none" : "0 2px 6px rgba(0,0,0,0.06)",
              transition: "all 0.15s",
            }}
            title={cmd}
          >
            {ARROW[cmd]}
          </button>
        ))}
      </div>

      {/* Queue display */}
      <div
        style={{
          minHeight: 56,
          background: "#f8fafc",
          border: "2px dashed #cbd5e1",
          borderRadius: "0.75rem",
          padding: "0.625rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.35rem",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        {queue.length === 0 ? (
          <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>
            Komut ekle...
          </span>
        ) : (
          queue.map((cmd, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38, height: 38,
                background: activeStep === i
                  ? "#f59e0b"
                  : activeStep !== null && i < activeStep
                  ? "#86efac"
                  : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "white",
                borderRadius: "0.5rem",
                fontSize: 18,
                fontWeight: 800,
                boxShadow: activeStep === i ? "0 0 0 3px #fbbf24" : "none",
                transform: activeStep === i ? "scale(1.25)" : "scale(1)",
                transition: "all 0.2s",
              }}
            >
              {ARROW[cmd]}
            </span>
          ))
        )}
      </div>

      {/* Step counter while playing */}
      {isPlaying && activeStep !== null && (
        <div style={{ textAlign: "center", marginBottom: "0.75rem", fontWeight: 700, color: "#7c3aed", fontSize: 14 }}>
          Adım {activeStep + 1} / {queue.length}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
        {isPlaying ? (
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: "0.65rem 1.5rem",
              background: "#ef4444", color: "white",
              border: "none", borderRadius: "0.75rem",
              cursor: "pointer", fontWeight: 800, fontSize: 15,
              minHeight: "44px",
            }}
          >
            ⏹ Durdur
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={queue.length === 0}
              onClick={handleRun}
              style={{
                padding: "0.65rem 1.5rem",
                background: queue.length === 0 ? "#e2e8f0" : "linear-gradient(135deg, #16a34a, #15803d)",
                color: queue.length === 0 ? "#94a3b8" : "white",
                border: "none", borderRadius: "0.75rem",
                cursor: queue.length === 0 ? "default" : "pointer",
                fontWeight: 800, fontSize: 15,
                minHeight: "44px",
                boxShadow: queue.length === 0 ? "none" : "0 4px 12px rgba(22,163,74,0.35)",
              }}
            >
              ▶ Çalıştır
            </button>
            <button
              type="button"
              disabled={queue.length === 0}
              onClick={() => setQueue((q) => q.slice(0, -1))}
              style={{
                padding: "0.65rem 1rem",
                background: "white", border: "2px solid #e2e8f0",
                borderRadius: "0.75rem",
                cursor: queue.length === 0 ? "default" : "pointer",
                fontWeight: 700, minHeight: "44px",
                color: queue.length === 0 ? "#94a3b8" : "#374151",
              }}
            >
              ⌫ Geri Al
            </button>
            <button
              type="button"
              disabled={queue.length === 0}
              onClick={() => setQueue([])}
              style={{
                padding: "0.65rem 1rem",
                background: "white", border: "2px solid #e2e8f0",
                borderRadius: "0.75rem",
                cursor: queue.length === 0 ? "default" : "pointer",
                fontWeight: 700, minHeight: "44px",
                color: queue.length === 0 ? "#94a3b8" : "#374151",
              }}
            >
              Temizle
            </button>
          </>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#7c3aed", fontWeight: 700 }}>
          ← World map
        </Link>
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
