"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { computeReward, simulateConditional } from "@cognitive/game-engine";
import type {
  EngineState, GridCommand, ConditionalInstruction, IfBlock,
  Condition, Direction, Action,
} from "@cognitive/game-engine";
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

const CONDITIONS: { value: Condition; label: string; icon: string }[] = [
  { value: "WALL_AHEAD",  label: "Önde Duvar?",  icon: "🧱⬆️" },
  { value: "WALL_RIGHT",  label: "Sağda Duvar?", icon: "🧱➡️" },
  { value: "WALL_LEFT",   label: "Solda Duvar?", icon: "🧱⬅️" },
  { value: "CLEAR_AHEAD", label: "Önü Açık?",    icon: "✅⬆️" },
  { value: "GOAL_AHEAD",  label: "Önde Hedef?",  icon: "⭐⬆️" },
];

interface AnimPos { x: number; y: number }

interface Props {
  state: EngineState;
  onAction: (action: Action) => void;
  worldId: string;
  levelId: string;
  nextLevelHref: string | null;
}

type EditingSlot = null | { instIdx: number; branch: "then" | "else" };

export function ConditionalCanvas({ state, onAction, worldId, levelId, nextLevelHref }: Props) {
  const { level, grid, phase, commandHistory } = state;

  const [program, setProgram] = useState<ConditionalInstruction[]>([]);
  const [facing, setFacing] = useState<Direction>("RIGHT");
  const [editing, setEditing] = useState<EditingSlot>(null); // which branch is being edited
  const [pendingIf, setPendingIf] = useState<Condition | null>(null); // condition picker
  const [animPos, setAnimPos] = useState<AnimPos | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);

  const cellSize = 52;

  const addCommand = useCallback((cmd: GridCommand) => {
    playSound("click");
    if (editing !== null) {
      setProgram((prev) => {
        const next = [...prev];
        const block = next[editing.instIdx] as IfBlock;
        if (editing.branch === "then") {
          next[editing.instIdx] = { ...block, then: [...block.then, cmd] };
        } else {
          next[editing.instIdx] = { ...block, else: [...(block.else ?? []), cmd] };
        }
        return next;
      });
    } else {
      setProgram((prev) => [...prev, cmd]);
    }
  }, [editing]);

  const addIfBlock = useCallback((cond: Condition) => {
    const newIdx = program.length;
    setProgram((prev) => [...prev, { type: "IF", condition: cond, then: [], else: undefined }]);
    setEditing({ instIdx: newIdx, branch: "then" });
    setPendingIf(null);
  }, [program.length]);

  const removeLastFromProgram = useCallback(() => {
    if (editing !== null) {
      setProgram((prev) => {
        const next = [...prev];
        const block = next[editing.instIdx] as IfBlock;
        if (editing.branch === "then" && block.then.length > 0) {
          next[editing.instIdx] = { ...block, then: block.then.slice(0, -1) };
        } else if (editing.branch === "else" && (block.else?.length ?? 0) > 0) {
          next[editing.instIdx] = { ...block, else: (block.else ?? []).slice(0, -1) };
        }
        return next;
      });
    } else {
      setProgram((prev) => prev.slice(0, -1));
    }
  }, [editing]);

  const handleRun = useCallback(async () => {
    if (!grid || program.length === 0) return;
    cancelRef.current = false;
    setIsPlaying(true);
    setEditing(null);

    const { flatCommands } = simulateConditional(program, grid, facing);
    let pos = { x: grid.position.x, y: grid.position.y };
    setAnimPos(pos);

    for (const cmd of flatCommands) {
      if (cancelRef.current) break;
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

    setIsPlaying(false);
    setAnimPos(null);
    if (!cancelRef.current) {
      onAction({ type: "RUN_CONDITIONAL", instructions: program, facing });
      setProgram([]);
    }
  }, [grid, program, facing, onAction]);

  if (!level) return <p>No level loaded</p>;

  if (phase === "intro") {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🤔</div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#1e293b" }}>
          {level.learning_goal}
        </h3>
        <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: 14, maxWidth: 300, margin: "0 auto 1.5rem" }}>
          {level.expected_behavior}
        </p>
        <button
          type="button"
          onClick={() => { setProgram([]); onAction({ type: "START_LEVEL" }); }}
          style={{
            padding: "0.75rem 2rem", background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            color: "white", border: "none", borderRadius: "1rem",
            cursor: "pointer", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 14px rgba(14,165,233,0.4)",
          }}
        >
          🤔 Düşün ve Karar Ver!
        </button>
      </div>
    );
  }

  if (phase === "success" && level) {
    const r = computeReward(level, commandHistory);
    return <SuccessFeedback stars={r.stars} xp={r.xp} nextLevelHref={nextLevelHref} worldHref={`/world/${worldId}`} />;
  }

  if (phase === "fail") {
    return <FailFeedback onRetry={() => { setProgram([]); setAnimPos(null); setEditing(null); onAction({ type: "RETRY" }); }} />;
  }

  if (!grid) return <p>No grid</p>;

  const displayPos = animPos ?? grid.position;
  const isObstacle = (x: number, y: number) => (grid.obstacles ?? []).some((o) => o.x === x && o.y === y);
  const isGoal = (x: number, y: number) => grid.goal.x === x && grid.goal.y === y;

  return (
    <div style={{ padding: "0.5rem", fontFamily: "Nunito, sans-serif", maxWidth: 500, margin: "0 auto" }}>

      {/* Facing selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Robot yönü:</span>
        {(["UP","DOWN","LEFT","RIGHT"] as Direction[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setFacing(d)}
            style={{
              width: 36, height: 36, fontSize: 16,
              background: facing === d ? "#0ea5e9" : "white",
              color: facing === d ? "white" : "#374151",
              border: `2px solid ${facing === d ? "#0ea5e9" : "#e2e8f0"}`,
              borderRadius: "0.5rem", cursor: "pointer", fontWeight: 700,
            }}
          >
            {ARROW[d]}
          </button>
        ))}
      </div>

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
            const goal = isGoal(x, y);
            const obstacle = isObstacle(x, y);
            return (
              <div key={`${x}-${y}`} style={{
                width: cellSize, height: cellSize,
                background: obstacle ? "#475569" : goal ? "#e0f2fe" : (x + y) % 2 === 0 ? "#f8fafc" : "#f1f5f9",
                border: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                {goal && !obstacle && <span style={{ fontSize: 26 }}>⭐</span>}
                {obstacle && <span>🧱</span>}
              </div>
            );
          })}
        </div>
        {/* Animated player */}
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

      {/* Program area */}
      <div style={{
        minHeight: 72, background: "#f0f9ff",
        border: `2px ${editing !== null ? "solid #0ea5e9" : "dashed #7dd3fc"}`,
        borderRadius: "0.875rem", padding: "0.625rem", marginBottom: "0.75rem",
        display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "flex-start",
      }}>
        {program.length === 0 ? (
          <span style={{ color: "#0369a1", fontSize: 13, fontWeight: 600, alignSelf: "center", width: "100%", textAlign: "center" }}>
            Komut veya 🤔 IF bloğu ekle...
          </span>
        ) : (
          program.map((inst, idx) => {
            if (typeof inst === "string") {
              return (
                <span key={idx} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36,
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  color: "white", borderRadius: "0.5rem", fontSize: 17, fontWeight: 800,
                  cursor: isPlaying ? "default" : "pointer",
                }} onClick={() => { if (!isPlaying) setEditing(null); }}>
                  {ARROW[inst]}
                </span>
              );
            }
            const block = inst as IfBlock;
            const isEditingThis = editing?.instIdx === idx;
            const condLabel = CONDITIONS.find((c) => c.value === block.condition);
            return (
              <div key={idx} style={{
                display: "flex", flexDirection: "column", gap: "0.25rem",
                background: isEditingThis ? "#e0f2fe" : "#f0f9ff",
                border: `2px solid ${isEditingThis ? "#0ea5e9" : "#7dd3fc"}`,
                borderRadius: "0.75rem", padding: "0.4rem 0.6rem",
                cursor: isPlaying ? "default" : "pointer",
                minWidth: 120,
              }}>
                <div style={{ fontWeight: 800, color: "#0284c7", fontSize: 12 }}>
                  🤔 IF {condLabel?.icon} {condLabel?.label}
                </div>
                {/* THEN branch */}
                <div
                  style={{
                    display: "flex", flexWrap: "wrap", gap: "0.2rem",
                    background: editing?.instIdx === idx && editing.branch === "then" ? "#bae6fd" : "white",
                    border: "1.5px solid #7dd3fc", borderRadius: "0.5rem", padding: "0.25rem 0.4rem",
                    cursor: "pointer", minHeight: 32,
                  }}
                  onClick={(e) => { e.stopPropagation(); if (!isPlaying) setEditing({ instIdx: idx, branch: "then" }); }}
                >
                  <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700, marginRight: 4 }}>THEN:</span>
                  {block.then.map((c, ci) => (
                    <span key={ci} style={{ fontSize: 14 }}>{ARROW[c]}</span>
                  ))}
                  {block.then.length === 0 && <span style={{ color: "#94a3b8", fontSize: 11 }}>boş</span>}
                </div>
                {/* ELSE branch toggle */}
                <div
                  style={{
                    display: "flex", flexWrap: "wrap", gap: "0.2rem",
                    background: editing?.instIdx === idx && editing.branch === "else" ? "#bae6fd" : "white",
                    border: "1.5px dashed #7dd3fc", borderRadius: "0.5rem", padding: "0.25rem 0.4rem",
                    cursor: "pointer", minHeight: 32,
                  }}
                  onClick={(e) => { e.stopPropagation(); if (!isPlaying) setEditing({ instIdx: idx, branch: "else" }); }}
                >
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginRight: 4 }}>ELSE:</span>
                  {(block.else ?? []).map((c, ci) => (
                    <span key={ci} style={{ fontSize: 14 }}>{ARROW[c]}</span>
                  ))}
                  {(block.else ?? []).length === 0 && <span style={{ color: "#94a3b8", fontSize: 11 }}>boş (isteğe bağlı)</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Editing hint */}
      {editing !== null && !isPlaying && (
        <div style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: 12, color: "#0284c7", fontWeight: 700 }}>
          ✏️ {editing.branch.toUpperCase()} dalına komut ekliyorsun — farklı bloğa tıkla
        </div>
      )}

      {/* Condition picker modal */}
      {pendingIf && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "white", borderRadius: "1rem", padding: "1.5rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxWidth: 320, width: "90%",
          }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: "1rem", color: "#0284c7" }}>
              🤔 Hangi koşulu kontrol edelim?
            </div>
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => addIfBlock(c.value)}
                style={{
                  display: "block", width: "100%", padding: "0.6rem 1rem",
                  marginBottom: "0.4rem", background: "#f0f9ff",
                  border: "2px solid #7dd3fc", borderRadius: "0.75rem",
                  cursor: "pointer", fontWeight: 700, fontSize: 14, textAlign: "left",
                  color: "#0284c7",
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPendingIf(null)}
              style={{ marginTop: "0.5rem", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Command buttons */}
      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginBottom: "0.75rem" }}>
        {(["UP", "DOWN", "LEFT", "RIGHT"] as GridCommand[]).map((cmd) => (
          <button
            key={cmd}
            type="button"
            disabled={isPlaying}
            onClick={() => addCommand(cmd)}
            style={{
              width: 50, height: 50, fontSize: 20,
              background: isPlaying ? "#f1f5f9" : editing !== null ? "#e0f2fe" : "white",
              border: `2px solid ${editing !== null ? "#0ea5e9" : "#e2e8f0"}`,
              borderRadius: "0.75rem", cursor: isPlaying ? "default" : "pointer", fontWeight: 700,
            }}
          >
            {ARROW[cmd]}
          </button>
        ))}
        <button
          type="button"
          disabled={isPlaying || editing !== null}
          onClick={() => setPendingIf("WALL_AHEAD")}
          style={{
            height: 50, padding: "0 0.6rem", fontSize: 12,
            background: isPlaying || editing !== null ? "#f1f5f9" : "linear-gradient(135deg, #e0f2fe, #bae6fd)",
            border: "2px solid #0ea5e9", borderRadius: "0.75rem",
            cursor: isPlaying || editing !== null ? "default" : "pointer",
            fontWeight: 800, color: "#0284c7", whiteSpace: "nowrap",
          }}
        >
          🤔 IF
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
        {isPlaying ? (
          <button type="button" onClick={() => { cancelRef.current = true; setIsPlaying(false); setAnimPos(null); }}
            style={{ padding: "0.65rem 1.5rem", background: "#ef4444", color: "white", border: "none", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 800, fontSize: 15, minHeight: "44px" }}>
            ⏹ Durdur
          </button>
        ) : (
          <>
            <button type="button" disabled={program.length === 0} onClick={handleRun}
              style={{ padding: "0.65rem 1.5rem", background: program.length === 0 ? "#e2e8f0" : "linear-gradient(135deg, #16a34a, #15803d)", color: program.length === 0 ? "#94a3b8" : "white", border: "none", borderRadius: "0.75rem", cursor: program.length === 0 ? "default" : "pointer", fontWeight: 800, fontSize: 15, minHeight: "44px" }}>
              ▶ Çalıştır
            </button>
            <button type="button" disabled={program.length === 0} onClick={removeLastFromProgram}
              style={{ padding: "0.65rem 1rem", background: "white", border: "2px solid #e2e8f0", borderRadius: "0.75rem", cursor: program.length === 0 ? "default" : "pointer", fontWeight: 700, minHeight: "44px", color: program.length === 0 ? "#94a3b8" : "#374151" }}>
              ⌫ Geri Al
            </button>
            <button type="button" disabled={program.length === 0} onClick={() => { setProgram([]); setEditing(null); }}
              style={{ padding: "0.65rem 1rem", background: "white", border: "2px solid #e2e8f0", borderRadius: "0.75rem", cursor: program.length === 0 ? "default" : "pointer", fontWeight: 700, minHeight: "44px", color: program.length === 0 ? "#94a3b8" : "#374151" }}>
              Temizle
            </button>
          </>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#0ea5e9", fontWeight: 700 }}>← World map</Link>
      </div>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
