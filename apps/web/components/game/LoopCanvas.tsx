"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { computeReward, expandInstructions } from "@cognitive/game-engine";
import type { EngineState, GridCommand, LoopInstruction, RepeatBlock, Action } from "@cognitive/game-engine";
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

interface AnimPos { x: number; y: number }

interface LoopCanvasProps {
  state: EngineState;
  onAction: (action: Action) => void;
  worldId: string;
  levelId: string;
  nextLevelHref: string | null;
}

export function LoopCanvas({ state, onAction, worldId, levelId, nextLevelHref }: LoopCanvasProps) {
  const { level, grid, phase, commandHistory } = state;

  // program = list of LoopInstructions
  const [program, setProgram] = useState<LoopInstruction[]>([]);
  // if not null, commands go into this loop block index
  const [editingLoop, setEditingLoop] = useState<number | null>(null);
  const [animPos, setAnimPos] = useState<AnimPos | null>(null);
  const [activeFlat, setActiveFlat] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);

  const cellSize = 52;

  const addCommand = useCallback((cmd: GridCommand) => {
    if (editingLoop !== null) {
      setProgram((prev) => {
        const next = [...prev];
        const block = next[editingLoop] as RepeatBlock;
        next[editingLoop] = { ...block, body: [...block.body, cmd] };
        return next;
      });
    } else {
      setProgram((prev) => [...prev, cmd]);
    }
  }, [editingLoop]);

  const addLoop = useCallback(() => {
    setProgram((prev) => {
      const newIdx = prev.length;
      const updated = [...prev, { type: "REPEAT" as const, count: 2, body: [] }];
      setEditingLoop(newIdx);
      return updated;
    });
  }, []);

  const changeLoopCount = useCallback((idx: number, delta: number) => {
    setProgram((prev) => {
      const next = [...prev];
      const block = next[idx] as RepeatBlock;
      const newCount = Math.max(1, Math.min(9, block.count + delta));
      next[idx] = { ...block, count: newCount };
      return next;
    });
  }, []);

  const removeLastFromProgram = useCallback(() => {
    if (editingLoop !== null) {
      setProgram((prev) => {
        const next = [...prev];
        const block = next[editingLoop] as RepeatBlock;
        if (block.body.length === 0) return next;
        next[editingLoop] = { ...block, body: block.body.slice(0, -1) };
        return next;
      });
    } else {
      setProgram((prev) => prev.slice(0, -1));
    }
  }, [editingLoop]);

  const handleRun = useCallback(async () => {
    if (!grid || program.length === 0) return;

    cancelRef.current = false;
    setIsPlaying(true);
    setEditingLoop(null);

    const flat = expandInstructions(program);
    let pos = { x: grid.position.x, y: grid.position.y };
    setAnimPos(pos);

    const obstacles: Array<{ x: number; y: number }> = grid.obstacles ?? [];

    for (let i = 0; i < flat.length; i++) {
      if (cancelRef.current) break;
      setActiveFlat(i);

      const cmd = flat[i]!;
      const { dx, dy } = DELTA[cmd];
      const next = { x: pos.x + dx, y: pos.y + dy };
      const blocked =
        next.x < 0 || next.x >= grid.cols ||
        next.y < 0 || next.y >= grid.rows ||
        obstacles.some((o) => o.x === next.x && o.y === next.y);

      if (!blocked) {
        pos = next;
        setAnimPos({ ...pos });
      }
      playSound("loop_tick");
      await new Promise<void>((r) => setTimeout(r, 360));
    }

    setActiveFlat(null);
    setIsPlaying(false);
    setAnimPos(null);

    if (!cancelRef.current) {
      onAction({ type: "RUN_LOOP", instructions: program });
      setProgram([]);
    }
  }, [grid, program, onAction]);

  const handleCancel = () => {
    cancelRef.current = true;
    setIsPlaying(false);
    setAnimPos(null);
    setActiveFlat(null);
  };

  if (!level) return <p>No level loaded</p>;

  if (phase === "intro") {
    return (
      <div style={{ padding: "1.5rem", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🔁</div>
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
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "white", border: "none", borderRadius: "1rem",
            cursor: "pointer", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 14px rgba(245,158,11,0.4)",
          }}
        >
          🔁 Döngüye Gir!
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
        onRetry={() => { setProgram([]); setAnimPos(null); setEditingLoop(null); onAction({ type: "RETRY" }); }}
      />
    );
  }

  if (!grid) return <p>No grid</p>;

  const displayPos = animPos ?? grid.position;
  const isObstacle = (x: number, y: number) => (grid.obstacles ?? []).some((o) => o.x === x && o.y === y);
  const isGoal = (x: number, y: number) => grid.goal.x === x && grid.goal.y === y;

  // Compute flat index offset for each loop block (for animation highlighting)
  const flatOffsets: number[] = [];
  let offset = 0;
  for (const inst of program) {
    flatOffsets.push(offset);
    if (typeof inst === "string") {
      offset += 1;
    } else {
      offset += inst.count * inst.body.length;
    }
  }

  const totalFlatSteps = expandInstructions(program).length;

  return (
    <div style={{ padding: "0.5rem", fontFamily: "Nunito, sans-serif", maxWidth: 500, margin: "0 auto" }}>

      {/* Grid */}
      <div style={{ position: "relative", width: grid.cols * cellSize, margin: "0 auto 1rem" }}>
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
                  width: cellSize, height: cellSize,
                  background: obstacle ? "#475569" : goal ? "#fef3c7" : (x + y) % 2 === 0 ? "#f8fafc" : "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}
              >
                {goal && !obstacle && <span style={{ fontSize: 26 }}>⭐</span>}
                {obstacle && <span>🧱</span>}
              </div>
            );
          })}
        </div>
        {/* Animated player */}
        <div
          style={{
            position: "absolute",
            width: cellSize, height: cellSize,
            top: displayPos.y * cellSize,
            left: displayPos.x * cellSize,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
            transition: isPlaying ? "top 0.30s cubic-bezier(.4,0,.2,1), left 0.30s cubic-bezier(.4,0,.2,1)" : "none",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <span style={{ display: "block", animation: isPlaying ? "bounce 0.36s ease-in-out infinite alternate" : "none" }}>
            🤖
          </span>
        </div>
      </div>

      {/* Play progress */}
      {isPlaying && activeFlat !== null && (
        <div style={{ textAlign: "center", marginBottom: "0.5rem", fontWeight: 700, color: "#f59e0b", fontSize: 14 }}>
          Adım {activeFlat + 1} / {totalFlatSteps}
        </div>
      )}

      {/* Program area */}
      <div
        style={{
          minHeight: 64,
          background: "#fffbeb",
          border: `2px ${editingLoop !== null ? "solid #f59e0b" : "dashed #fcd34d"}`,
          borderRadius: "0.875rem",
          padding: "0.625rem",
          marginBottom: "0.75rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          alignItems: "flex-start",
        }}
      >
        {program.length === 0 ? (
          <span style={{ color: "#a16207", fontSize: 13, fontWeight: 600, alignSelf: "center", width: "100%", textAlign: "center" }}>
            Komut veya 🔁 döngü ekle...
          </span>
        ) : (
          program.map((inst, idx) => {
            if (typeof inst === "string") {
              const flatIdx = flatOffsets[idx]!;
              const active = activeFlat === flatIdx;
              const done = activeFlat !== null && flatIdx < activeFlat;
              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 38, height: 38,
                    background: active ? "#f59e0b" : done ? "#86efac" : "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "white",
                    borderRadius: "0.5rem",
                    fontSize: 18, fontWeight: 800,
                    boxShadow: active ? "0 0 0 3px #fbbf24" : "none",
                    transform: active ? "scale(1.25)" : "scale(1)",
                    transition: "all 0.2s",
                    cursor: isPlaying ? "default" : "pointer",
                  }}
                  onClick={() => {
                    if (!isPlaying) setEditingLoop(null);
                  }}
                >
                  {ARROW[inst]}
                </span>
              );
            }

            // RepeatBlock
            const block = inst;
            const isEditing = editingLoop === idx;
            const blockStart = flatOffsets[idx]!;
            const blockSize = block.count * block.body.length;
            const blockActive = activeFlat !== null && activeFlat >= blockStart && activeFlat < blockStart + blockSize;

            return (
              <div
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  background: isEditing ? "#fef3c7" : blockActive ? "#fde68a" : "#fff7ed",
                  border: `2px solid ${isEditing ? "#f59e0b" : blockActive ? "#fbbf24" : "#fcd34d"}`,
                  borderRadius: "0.75rem",
                  padding: "0.3rem 0.5rem",
                  cursor: isPlaying ? "default" : "pointer",
                  boxShadow: isEditing ? "0 0 0 3px rgba(245,158,11,0.3)" : "none",
                  flexWrap: "wrap",
                  maxWidth: "100%",
                }}
                onClick={() => { if (!isPlaying) setEditingLoop(isEditing ? null : idx); }}
              >
                {/* Repeat icon + count */}
                <span style={{ fontSize: 16, fontWeight: 900, color: "#92400e" }}>🔁</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (!isPlaying) changeLoopCount(idx, -1); }}
                  style={{ width: 22, height: 22, border: "1.5px solid #f59e0b", borderRadius: "50%", background: "white", cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >−</button>
                <span style={{ fontWeight: 900, color: "#92400e", fontSize: 16, minWidth: 14, textAlign: "center" }}>
                  {block.count}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (!isPlaying) changeLoopCount(idx, 1); }}
                  style={{ width: 22, height: 22, border: "1.5px solid #f59e0b", borderRadius: "50%", background: "white", cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                >+</button>
                <span style={{ color: "#d97706", fontSize: 13, fontWeight: 700 }}>×</span>
                {/* Body commands */}
                <div style={{ display: "flex", gap: "0.2rem", flexWrap: "wrap" }}>
                  {block.body.length === 0 ? (
                    <span style={{ color: "#a16207", fontSize: 11, fontStyle: "italic" }}>boş</span>
                  ) : (
                    block.body.map((cmd, bi) => {
                      const flatIdx = blockStart + (bi % block.body.length); // simplified
                      const active = activeFlat === flatIdx;
                      return (
                        <span
                          key={bi}
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 30, height: 30,
                            background: active ? "#fbbf24" : "linear-gradient(135deg, #f59e0b, #d97706)",
                            color: "white",
                            borderRadius: "0.4rem",
                            fontSize: 15, fontWeight: 800,
                            transform: active ? "scale(1.2)" : "scale(1)",
                            transition: "all 0.2s",
                          }}
                        >
                          {ARROW[cmd]}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Editing hint */}
      {editingLoop !== null && !isPlaying && (
        <div style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: 12, color: "#a16207", fontWeight: 700 }}>
          ✏️ Döngü içine komut ekliyorsun — dışarı çıkmak için döngüye tıkla
        </div>
      )}

      {/* Direction buttons */}
      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginBottom: "0.75rem" }}>
        {(["UP", "DOWN", "LEFT", "RIGHT"] as GridCommand[]).map((cmd) => (
          <button
            key={cmd}
            type="button"
            disabled={isPlaying}
            onClick={() => { playSound("click"); addCommand(cmd); }}
            style={{
              width: 52, height: 52, fontSize: 22,
              background: isPlaying ? "#f1f5f9" : editingLoop !== null ? "#fef3c7" : "white",
              border: `2px solid ${editingLoop !== null ? "#f59e0b" : "#e2e8f0"}`,
              borderRadius: "0.75rem",
              cursor: isPlaying ? "default" : "pointer",
              fontWeight: 700,
              boxShadow: isPlaying ? "none" : "0 2px 6px rgba(0,0,0,0.06)",
            }}
            title={cmd}
          >
            {ARROW[cmd]}
          </button>
        ))}
        <button
          type="button"
          disabled={isPlaying}
          onClick={addLoop}
          style={{
            height: 52, padding: "0 0.75rem", fontSize: 13,
            background: isPlaying ? "#f1f5f9" : "linear-gradient(135deg, #fef3c7, #fde68a)",
            border: "2px solid #f59e0b",
            borderRadius: "0.75rem",
            cursor: isPlaying ? "default" : "pointer",
            fontWeight: 800, color: "#92400e",
            boxShadow: "none",
            whiteSpace: "nowrap",
          }}
        >
          🔁 Döngü
        </button>
      </div>

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
              cursor: "pointer", fontWeight: 800, fontSize: 15, minHeight: "44px",
            }}
          >
            ⏹ Durdur
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={program.length === 0}
              onClick={handleRun}
              style={{
                padding: "0.65rem 1.5rem",
                background: program.length === 0 ? "#e2e8f0" : "linear-gradient(135deg, #16a34a, #15803d)",
                color: program.length === 0 ? "#94a3b8" : "white",
                border: "none", borderRadius: "0.75rem",
                cursor: program.length === 0 ? "default" : "pointer",
                fontWeight: 800, fontSize: 15, minHeight: "44px",
                boxShadow: program.length === 0 ? "none" : "0 4px 12px rgba(22,163,74,0.35)",
              }}
            >
              ▶ Çalıştır
            </button>
            <button
              type="button"
              disabled={program.length === 0}
              onClick={removeLastFromProgram}
              style={{
                padding: "0.65rem 1rem",
                background: "white", border: "2px solid #e2e8f0",
                borderRadius: "0.75rem",
                cursor: program.length === 0 ? "default" : "pointer",
                fontWeight: 700, minHeight: "44px",
                color: program.length === 0 ? "#94a3b8" : "#374151",
              }}
            >
              ⌫ Geri Al
            </button>
            <button
              type="button"
              disabled={program.length === 0}
              onClick={() => { setProgram([]); setEditingLoop(null); }}
              style={{
                padding: "0.65rem 1rem",
                background: "white", border: "2px solid #e2e8f0",
                borderRadius: "0.75rem",
                cursor: program.length === 0 ? "default" : "pointer",
                fontWeight: 700, minHeight: "44px",
                color: program.length === 0 ? "#94a3b8" : "#374151",
              }}
            >
              Temizle
            </button>
          </>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#f59e0b", fontWeight: 700 }}>
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
