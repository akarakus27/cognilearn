"use client";

import { useState, useRef, useCallback, useMemo } from "react";
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

type FuncName = string;
type ProgramStep = GridCommand | { type: "CALL"; name: FuncName };

interface AnimPos { x: number; y: number }

interface Props {
  state: EngineState;
  onAction: (action: Action) => void;
  worldId: string;
  levelId: string;
  nextLevelHref: string | null;
}

export function FunctionCanvas({ state, onAction, worldId, levelId, nextLevelHref }: Props) {
  const { level, grid, phase, commandHistory } = state;

  // Parse function definitions from level meta
  const funcDefs = useMemo<Record<FuncName, GridCommand[]>>(() => {
    const m = level?.meta as { functions?: Record<string, string[]> } | undefined;
    return (m?.functions as Record<FuncName, GridCommand[]>) ?? {};
  }, [level]);

  const funcNames = Object.keys(funcDefs);

  // Main program: list of steps (direct commands or function calls)
  const [program, setProgram] = useState<ProgramStep[]>([]);
  // Whether we're editing the definition of a function
  const [editingFunc, setEditingFunc] = useState<FuncName | null>(null);
  // User-defined function bodies (starts from level meta)
  const [userFuncs, setUserFuncs] = useState<Record<FuncName, GridCommand[]>>(() => {
    const m = level?.meta as { functions?: Record<string, string[]> } | undefined;
    const defs = m?.functions as Record<string, GridCommand[]> | undefined;
    if (!defs) return {};
    // Start with pre-filled definitions so player can see what each does
    return { ...defs };
  });

  const [animPos, setAnimPos] = useState<AnimPos | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);
  const cellSize = 52;

  // Expand program to flat GridCommands using user-defined functions
  const expandProgram = useCallback((prog: ProgramStep[]): GridCommand[] => {
    const flat: GridCommand[] = [];
    for (const step of prog) {
      if (typeof step === "string") {
        flat.push(step);
      } else {
        const body = userFuncs[step.name] ?? [];
        flat.push(...body);
      }
    }
    return flat;
  }, [userFuncs]);

  const handleRun = useCallback(async () => {
    if (!grid || program.length === 0) return;
    cancelRef.current = false;
    setIsPlaying(true);
    setEditingFunc(null);

    const flat = expandProgram(program);
    let pos = { x: grid.position.x, y: grid.position.y };
    setAnimPos(pos);

    for (let i = 0; i < flat.length; i++) {
      if (cancelRef.current) break;
      setActiveStep(i);
      const cmd = flat[i]!;
      const { dx, dy } = DELTA[cmd];
      const next = { x: pos.x + dx, y: pos.y + dy };
      const blocked =
        next.x < 0 || next.x >= grid.cols ||
        next.y < 0 || next.y >= grid.rows ||
        (grid.obstacles ?? []).some((o) => o.x === next.x && o.y === next.y);
      if (!blocked) { pos = next; setAnimPos({ ...pos }); }
      playSound("step");
      await new Promise<void>((r) => setTimeout(r, 380));
    }

    setActiveStep(null);
    setIsPlaying(false);
    setAnimPos(null);
    if (!cancelRef.current) {
      onAction({ type: "RUN_SEQUENCE", commands: flat });
      setProgram([]);
    }
  }, [grid, program, expandProgram, onAction]);

  if (!level) return <p>No level loaded</p>;

  if (phase === "intro") {
    const hint = (level.meta as { hint?: string } | undefined)?.hint;
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🔧</div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#1e293b" }}>{level.learning_goal}</h3>
        <p style={{ color: "#64748b", marginBottom: "0.5rem", fontSize: 14 }}>{level.expected_behavior}</p>
        {hint && <p style={{ color: "#7c3aed", fontSize: 13, fontWeight: 700, marginBottom: "1.5rem" }}>💡 {hint}</p>}
        <button
          type="button"
          onClick={() => { setProgram([]); onAction({ type: "START_LEVEL" }); }}
          style={{
            padding: "0.75rem 2rem", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", border: "none", borderRadius: "1rem",
            cursor: "pointer", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
          }}
        >
          🔧 Fonksiyon Yaz!
        </button>
      </div>
    );
  }

  if (phase === "success" && level) {
    const r = computeReward(level, commandHistory);
    return <SuccessFeedback stars={r.stars} xp={r.xp} nextLevelHref={nextLevelHref} worldHref={`/world/${worldId}`} />;
  }

  if (phase === "fail") {
    return <FailFeedback onRetry={() => { setProgram([]); setAnimPos(null); setEditingFunc(null); onAction({ type: "RETRY" }); }} />;
  }

  if (!grid) return <p>No grid</p>;

  const displayPos = animPos ?? grid.position;
  const isObstacle = (x: number, y: number) => (grid.obstacles ?? []).some((o) => o.x === x && o.y === y);
  const isGoal = (x: number, y: number) => grid.goal.x === x && grid.goal.y === y;

  const flatForAnim = expandProgram(program);

  const FUNC_COLORS: Record<number, { bg: string; border: string; text: string }> = {
    0: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    1: { bg: "#ede9fe", border: "#7c3aed", text: "#4c1d95" },
    2: { bg: "#dcfce7", border: "#16a34a", text: "#14532d" },
  };

  return (
    <div style={{ padding: "0.5rem", fontFamily: "Nunito, sans-serif", maxWidth: 500, margin: "0 auto" }}>

      {/* Grid */}
      <div style={{ position: "relative", width: grid.cols * cellSize, margin: "0 auto 1rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${grid.rows}, ${cellSize}px)`,
          border: "2px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden",
        }}>
          {Array.from({ length: grid.rows * grid.cols }, (_, i) => {
            const x = i % grid.cols;
            const y = Math.floor(i / grid.cols);
            return (
              <div key={`${x}-${y}`} style={{
                width: cellSize, height: cellSize,
                background: isObstacle(x, y) ? "#475569" : isGoal(x, y) ? "#ede9fe" : (x + y) % 2 === 0 ? "#f8fafc" : "#f1f5f9",
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
          transition: isPlaying ? "top 0.30s cubic-bezier(.4,0,.2,1), left 0.30s cubic-bezier(.4,0,.2,1)" : "none",
          pointerEvents: "none", zIndex: 10,
        }}>
          <span style={{ display: "block", animation: isPlaying ? "bounce 0.36s ease-in-out infinite alternate" : "none" }}>🤖</span>
        </div>
      </div>

      {/* Function definitions */}
      {funcNames.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: "0.4rem" }}>📦 Fonksiyonlar:</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {funcNames.map((name, fi) => {
              const col = FUNC_COLORS[fi % 3]!;
              const body = userFuncs[name] ?? [];
              const isEditing = editingFunc === name;
              return (
                <div
                  key={name}
                  onClick={() => { if (!isPlaying) setEditingFunc(isEditing ? null : name); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    background: isEditing ? col.border : col.bg,
                    border: `2px solid ${col.border}`,
                    borderRadius: "0.75rem", padding: "0.3rem 0.6rem",
                    cursor: isPlaying ? "default" : "pointer",
                    boxShadow: isEditing ? `0 0 0 3px ${col.border}44` : "none",
                  }}
                >
                  <span style={{ fontWeight: 900, color: isEditing ? "white" : col.text, fontSize: 13 }}>
                    🔧 {name}
                  </span>
                  <span style={{ color: isEditing ? "white" : col.text, fontSize: 14 }}>
                    = {body.map((c) => ARROW[c]).join(" ") || "?"}
                  </span>
                </div>
              );
            })}
          </div>
          {editingFunc && (
            <div style={{ marginTop: "0.4rem", fontSize: 11, color: "#7c3aed", fontWeight: 700, textAlign: "center" }}>
              ✏️ "{editingFunc}" fonksiyonuna komut ekliyorsun
            </div>
          )}
        </div>
      )}

      {/* Program area */}
      <div style={{
        minHeight: 56, background: "#faf5ff",
        border: `2px ${editingFunc === null ? "dashed #a78bfa" : "solid #e2e8f0"}`,
        borderRadius: "0.875rem", padding: "0.625rem", marginBottom: "0.75rem",
        display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center",
      }}>
        {program.length === 0 && editingFunc === null ? (
          <span style={{ color: "#7c3aed", fontSize: 13, fontWeight: 600, width: "100%", textAlign: "center" }}>
            Programa komut veya fonksiyon ekle...
          </span>
        ) : (
          program.map((step, i) => {
            const flatBase = expandProgram(program.slice(0, i)).length;
            if (typeof step === "string") {
              const active = activeStep === flatBase;
              const done = activeStep !== null && flatBase < activeStep;
              return (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36,
                  background: active ? "#f59e0b" : done ? "#86efac" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", borderRadius: "0.5rem", fontSize: 17, fontWeight: 800,
                  transform: active ? "scale(1.2)" : "scale(1)", transition: "all 0.2s",
                }}>{ARROW[step]}</span>
              );
            }
            const fi = funcNames.indexOf(step.name);
            const col = FUNC_COLORS[fi % 3]!;
            const funcBody = userFuncs[step.name] ?? [];
            const funcFlatLen = funcBody.length;
            const anyActive = activeStep !== null && activeStep >= flatBase && activeStep < flatBase + funcFlatLen;
            return (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: "0.2rem",
                background: anyActive ? col.border : col.bg,
                border: `2px solid ${col.border}`,
                borderRadius: "0.5rem", padding: "0.25rem 0.5rem",
                fontSize: 13, fontWeight: 800, color: anyActive ? "white" : col.text,
                transform: anyActive ? "scale(1.08)" : "scale(1)", transition: "all 0.2s",
              }}>
                🔧 {step.name}
              </div>
            );
          })
        )}
      </div>

      {/* Command + function call buttons */}
      <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {(["UP", "DOWN", "LEFT", "RIGHT"] as GridCommand[]).map((cmd) => (
          <button
            key={cmd}
            type="button"
            disabled={isPlaying}
            onClick={() => {
              playSound("click");
              if (editingFunc !== null) {
                setUserFuncs((prev) => ({ ...prev, [editingFunc]: [...(prev[editingFunc] ?? []), cmd] }));
              } else {
                setProgram((prev) => [...prev, cmd]);
              }
            }}
            style={{
              width: 48, height: 48, fontSize: 20,
              background: isPlaying ? "#f1f5f9" : editingFunc !== null ? "#ede9fe" : "white",
              border: `2px solid ${editingFunc !== null ? "#7c3aed" : "#e2e8f0"}`,
              borderRadius: "0.75rem", cursor: isPlaying ? "default" : "pointer",
            }}
          >
            {ARROW[cmd]}
          </button>
        ))}
        {funcNames.map((name, fi) => {
          const col = FUNC_COLORS[fi % 3]!;
          return (
            <button
              key={name}
              type="button"
              disabled={isPlaying || editingFunc !== null}
              onClick={() => { playSound("click"); setProgram((prev) => [...prev, { type: "CALL", name }]); }}
              style={{
                height: 48, padding: "0 0.6rem", fontSize: 12,
                background: isPlaying || editingFunc !== null ? "#f1f5f9" : col.bg,
                border: `2px solid ${isPlaying || editingFunc !== null ? "#e2e8f0" : col.border}`,
                borderRadius: "0.75rem", cursor: isPlaying || editingFunc !== null ? "default" : "pointer",
                fontWeight: 800, color: isPlaying || editingFunc !== null ? "#94a3b8" : col.text,
                whiteSpace: "nowrap",
              }}
            >
              🔧 {name}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
        {isPlaying ? (
          <button type="button" onClick={() => { cancelRef.current = true; setIsPlaying(false); setAnimPos(null); setActiveStep(null); }}
            style={{ padding: "0.65rem 1.5rem", background: "#ef4444", color: "white", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 800, fontSize: 15, minHeight: "44px" }}>
            ⏹ Durdur
          </button>
        ) : (
          <>
            <button type="button"
              disabled={program.length === 0 && editingFunc === null}
              onClick={() => {
                if (editingFunc !== null) {
                  setEditingFunc(null);
                } else {
                  handleRun();
                }
              }}
              style={{
                padding: "0.65rem 1.5rem",
                background: program.length === 0 && editingFunc === null ? "#e2e8f0" : editingFunc !== null ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "linear-gradient(135deg, #16a34a, #15803d)",
                color: program.length === 0 && editingFunc === null ? "#94a3b8" : "white",
                border: "none", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 800, fontSize: 15, minHeight: "44px",
              }}>
              {editingFunc !== null ? "✅ Func Tamam" : "▶ Çalıştır"}
            </button>
            <button type="button"
              disabled={program.length === 0 && editingFunc === null}
              onClick={() => {
                if (editingFunc !== null) {
                  setUserFuncs((prev) => ({ ...prev, [editingFunc]: (prev[editingFunc] ?? []).slice(0, -1) }));
                } else {
                  setProgram((p) => p.slice(0, -1));
                }
              }}
              style={{ padding: "0.65rem 1rem", background: "white", border: "2px solid #e2e8f0", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 700, minHeight: "44px", color: "#374151" }}>
              ⌫ Geri Al
            </button>
            <button type="button"
              disabled={program.length === 0}
              onClick={() => { setProgram([]); setEditingFunc(null); }}
              style={{ padding: "0.65rem 1rem", background: "white", border: "2px solid #e2e8f0", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 700, minHeight: "44px", color: program.length === 0 ? "#94a3b8" : "#374151" }}>
              Temizle
            </button>
          </>
        )}
      </div>

      {/* Flat preview */}
      {program.length > 0 && !isPlaying && (
        <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginBottom: "0.5rem" }}>
          Program açılımı: {flatForAnim.map((c) => ARROW[c]).join(" ")}
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#7c3aed", fontWeight: 700 }}>← World map</Link>
      </div>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
