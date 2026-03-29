"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { computeReward } from "@cognitive/game-engine";
import type { EngineState, GridCommand, Action } from "@cognitive/game-engine";
import { SuccessFeedback } from "./SuccessFeedback";
import { FailFeedback } from "./FailFeedback";
import { playSound } from "@/lib/sound";

const ARROW: Record<GridCommand, string> = {
  UP: "⬆️", DOWN: "⬇️", LEFT: "⬅️", RIGHT: "➡️",
};
const DELTA: Record<GridCommand, { dx: number; dy: number }> = {
  UP: { dx: 0, dy: -1 }, DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 }, RIGHT: { dx: 1, dy: 0 },
};
const ALL_COMMANDS: GridCommand[] = ["UP", "DOWN", "LEFT", "RIGHT"];

interface AnimPos { x: number; y: number }

interface Props {
  state: EngineState;
  onAction: (action: Action) => void;
  worldId: string;
  levelId: string;
  nextLevelHref: string | null;
}

export function DebugCanvas({ state, onAction, worldId, levelId, nextLevelHref }: Props) {
  const { level, grid, phase, commandHistory } = state;

  const meta = level?.meta as { buggy_solution?: GridCommand[]; bug_index?: number; hint?: string } | undefined;
  const buggyInit = meta?.buggy_solution ?? (level?.solution as GridCommand[] | undefined) ?? [];

  const [program, setProgram] = useState<GridCommand[]>([...buggyInit]);
  // Which chip is selected for replacement (index or null)
  const [selected, setSelected] = useState<number | null>(null);
  const [animPos, setAnimPos] = useState<AnimPos | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const cancelRef = useRef(false);
  const cellSize = 52;

  const handleRun = useCallback(async () => {
    if (!grid || program.length === 0) return;
    cancelRef.current = false;
    setIsPlaying(true);
    setSelected(null);
    setHasRun(true);

    let pos = { x: grid.position.x, y: grid.position.y };
    setAnimPos(pos);

    for (let i = 0; i < program.length; i++) {
      if (cancelRef.current) break;
      setActiveStep(i);
      const cmd = program[i]!;
      const { dx, dy } = DELTA[cmd];
      const next = { x: pos.x + dx, y: pos.y + dy };
      const blocked =
        next.x < 0 || next.x >= grid.cols ||
        next.y < 0 || next.y >= grid.rows ||
        (grid.obstacles ?? []).some((o) => o.x === next.x && o.y === next.y);
      if (!blocked) { pos = next; setAnimPos({ ...pos }); }
      playSound("step");
      await new Promise<void>((r) => setTimeout(r, 400));
    }

    setActiveStep(null);
    setIsPlaying(false);
    setAnimPos(null);
    if (!cancelRef.current) {
      onAction({ type: "RUN_SEQUENCE", commands: program });
    }
  }, [grid, program, onAction]);

  const replaceAt = (idx: number, cmd: GridCommand) => {
    playSound("click");
    setProgram((prev) => {
      const next = [...prev];
      next[idx] = cmd;
      return next;
    });
    setSelected(null);
  };

  if (!level) return <p>No level loaded</p>;

  if (phase === "intro") {
    const hint = meta?.hint;
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🐛</div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#1e293b" }}>{level.learning_goal}</h3>
        <p style={{ color: "#64748b", marginBottom: "0.5rem", fontSize: 14 }}>{level.expected_behavior}</p>
        {hint && <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 700, marginBottom: "1.5rem" }}>🔍 İpucu: {hint}</p>}
        <div style={{ background: "#fef2f2", border: "2px solid #fecaca", borderRadius: "0.75rem", padding: "0.75rem", marginBottom: "1.5rem", fontSize: 13, color: "#991b1b", fontWeight: 700 }}>
          ⚠️ Bu programda bir hata var! Önce çalıştır, sonra yanlış komutu düzelt.
        </div>
        <button
          type="button"
          onClick={() => { setProgram([...buggyInit]); setHasRun(false); onAction({ type: "START_LEVEL" }); }}
          style={{
            padding: "0.75rem 2rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            color: "white", border: "none", borderRadius: "1rem",
            cursor: "pointer", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 14px rgba(220,38,38,0.4)",
          }}
        >
          🐛 Bug'ı Bul!
        </button>
      </div>
    );
  }

  if (phase === "success" && level) {
    const r = computeReward(level, commandHistory);
    return <SuccessFeedback stars={r.stars} xp={r.xp} nextLevelHref={nextLevelHref} worldHref={`/world/${worldId}`} />;
  }

  if (phase === "fail") {
    return <FailFeedback onRetry={() => { setProgram([...buggyInit]); setAnimPos(null); setSelected(null); setHasRun(false); onAction({ type: "RETRY" }); }} />;
  }

  if (!grid) return <p>No grid</p>;

  const displayPos = animPos ?? grid.position;
  const isObstacle = (x: number, y: number) => (grid.obstacles ?? []).some((o) => o.x === x && o.y === y);
  const isGoal = (x: number, y: number) => grid.goal.x === x && grid.goal.y === y;

  return (
    <div style={{ padding: "0.5rem", fontFamily: "Nunito, sans-serif", maxWidth: 500, margin: "0 auto" }}>

      {/* Debug header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem",
        background: "#fef2f2", border: "2px solid #fecaca", borderRadius: "0.75rem", padding: "0.5rem 0.75rem",
        fontSize: 13, fontWeight: 700, color: "#991b1b",
      }}>
        🐛 Bozuk program — yanlış komutu bul ve düzelt!
        {hasRun && (
          <span style={{ marginLeft: "auto", color: "#dc2626", fontSize: 11 }}>
            Tıkla → değiştir
          </span>
        )}
      </div>

      {/* Grid */}
      <div style={{ position: "relative", width: grid.cols * cellSize, margin: "0 auto 1rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${grid.rows}, ${cellSize}px)`,
          border: "2px solid #fecaca", borderRadius: "0.75rem", overflow: "hidden",
        }}>
          {Array.from({ length: grid.rows * grid.cols }, (_, i) => {
            const x = i % grid.cols;
            const y = Math.floor(i / grid.cols);
            return (
              <div key={`${x}-${y}`} style={{
                width: cellSize, height: cellSize,
                background: isObstacle(x, y) ? "#475569" : isGoal(x, y) ? "#fef2f2" : (x + y) % 2 === 0 ? "#f8fafc" : "#f1f5f9",
                border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                {isGoal(x, y) && !isObstacle(x, y) && <span style={{ fontSize: 26 }}>⭐</span>}
                {isObstacle(x, y) && <span>🧱</span>}
              </div>
            );
          })}
        </div>
        <div style={{
          position: "absolute", width: cellSize, height: cellSize,
          top: displayPos.y * cellSize, left: displayPos.x * cellSize,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          transition: isPlaying ? "top 0.32s cubic-bezier(.4,0,.2,1), left 0.32s cubic-bezier(.4,0,.2,1)" : "none",
          pointerEvents: "none", zIndex: 10,
        }}>
          <span style={{ display: "block", animation: isPlaying ? "bounce 0.36s ease-in-out infinite alternate" : "none" }}>🤖</span>
        </div>
      </div>

      {/* Program chips — clickable for editing */}
      <div style={{
        minHeight: 56, background: "#fef2f2",
        border: "2px dashed #fecaca", borderRadius: "0.875rem",
        padding: "0.625rem", marginBottom: "0.75rem",
        display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center",
      }}>
        {program.map((cmd, i) => {
          const isActive = activeStep === i;
          const isDone = activeStep !== null && i < activeStep;
          const isSelected = selected === i;
          const wasBug = meta?.bug_index === i;
          return (
            <button
              key={i}
              type="button"
              disabled={isPlaying}
              onClick={() => { if (!isPlaying) { playSound("click"); setSelected(isSelected ? null : i); } }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 42, height: 42, fontSize: 18, fontWeight: 800,
                background: isActive ? "#f59e0b" : isDone ? "#86efac" : isSelected ? "#dc2626" : "white",
                color: isActive || isSelected ? "white" : isDone ? "#166534" : "#374151",
                border: `2px solid ${isActive ? "#f59e0b" : isSelected ? "#dc2626" : wasBug && hasRun ? "#fca5a5" : "#e2e8f0"}`,
                borderRadius: "0.5rem",
                cursor: isPlaying ? "default" : "pointer",
                transform: isSelected ? "scale(1.15)" : isActive ? "scale(1.2)" : "scale(1)",
                transition: "all 0.2s",
                boxShadow: isSelected ? "0 0 0 3px #fca5a5" : "none",
                position: "relative",
              }}
            >
              {ARROW[cmd]}
              {isSelected && (
                <span style={{
                  position: "absolute", top: -8, right: -8, fontSize: 10,
                  background: "#dc2626", color: "white", borderRadius: "50%",
                  width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900,
                }}>✏️</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Replacement picker */}
      {selected !== null && !isPlaying && (
        <div style={{
          background: "white", border: "2px solid #dc2626", borderRadius: "0.875rem",
          padding: "0.75rem", marginBottom: "0.75rem",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: "0.5rem" }}>
            🔄 {selected + 1}. komutu değiştir:
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            {ALL_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => replaceAt(selected, cmd)}
                style={{
                  width: 48, height: 48, fontSize: 20,
                  background: program[selected] === cmd ? "#dc2626" : "white",
                  color: program[selected] === cmd ? "white" : "#374151",
                  border: `2px solid ${program[selected] === cmd ? "#dc2626" : "#e2e8f0"}`,
                  borderRadius: "0.75rem", cursor: "pointer", fontWeight: 700,
                }}
              >
                {ARROW[cmd]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step counter while playing */}
      {isPlaying && activeStep !== null && (
        <div style={{ textAlign: "center", marginBottom: "0.75rem", fontWeight: 700, color: "#dc2626", fontSize: 14 }}>
          Adım {activeStep + 1} / {program.length}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
        {isPlaying ? (
          <button type="button" onClick={() => { cancelRef.current = true; setIsPlaying(false); setAnimPos(null); setActiveStep(null); }}
            style={{ padding: "0.65rem 1.5rem", background: "#ef4444", color: "white", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 800, fontSize: 15, minHeight: "44px" }}>
            ⏹ Durdur
          </button>
        ) : (
          <>
            <button type="button" onClick={handleRun}
              style={{ padding: "0.65rem 1.5rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "white", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 800, fontSize: 15, minHeight: "44px", boxShadow: "0 4px 12px rgba(220,38,38,0.35)" }}>
              ▶ Çalıştır
            </button>
            <button type="button" onClick={() => { setProgram([...buggyInit]); setSelected(null); setHasRun(false); }}
              style={{ padding: "0.65rem 1rem", background: "white", border: "2px solid #e2e8f0", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 700, minHeight: "44px", color: "#374151" }}>
              🔄 Sıfırla
            </button>
          </>
        )}
      </div>

      {!hasRun && !isPlaying && (
        <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: "0.5rem" }}>
          Önce çalıştır — robonun nereye gittiğini gör, sonra düzelt!
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#dc2626", fontWeight: 700 }}>← World map</Link>
      </div>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
