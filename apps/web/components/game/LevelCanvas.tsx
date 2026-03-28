"use client";

import Link from "next/link";
import { computeReward } from "@cognitive/game-engine";
import type { EngineState, GridCommand, Action } from "@cognitive/game-engine";
import { setLastPosition } from "@cognitive/utils";
import { SuccessFeedback } from "./SuccessFeedback";
import { FailFeedback } from "./FailFeedback";
import { SequenceCanvas } from "./SequenceCanvas";

function DPadBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 52, height: 52,
        background: "white",
        border: "2px solid #e2e8f0",
        borderRadius: "0.875rem",
        cursor: "pointer",
        fontSize: 24,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        transition: "transform 0.1s, box-shadow 0.1s",
      }}
      onPointerDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.92)"; }}
      onPointerUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      onPointerLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      {label}
    </button>
  );
}

interface LevelCanvasProps {
  state: EngineState;
  onAction: (action: Action) => void;
  worldId: string;
  levelId: string;
  nextLevelHref: string | null;
}

export function LevelCanvas(props: LevelCanvasProps) {
  const { state, onAction, worldId, levelId, nextLevelHref } = props;
  const { level, grid, phase, commandHistory } = state;

  if (!level) return <p>No level loaded</p>;

  if (level.mode === "sequence") {
    return (
      <SequenceCanvas
        state={state}
        onAction={onAction}
        worldId={worldId}
        levelId={levelId}
        nextLevelHref={nextLevelHref}
      />
    );
  }

  if (phase === "intro") {
    return (
      <div style={{
        padding: "2rem 1rem",
        textAlign: "center",
        fontFamily: "Nunito, system-ui, sans-serif",
      }}>
        {/* In Progress Banner */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          border: "2px solid #f59e0b",
          borderRadius: "2rem",
          padding: "0.4rem 1rem",
          fontSize: 13,
          fontWeight: 800,
          color: "#92400e",
          marginBottom: "1.5rem",
        }}>
          🚧 Yapım Aşamasında
        </div>

        {/* Icon */}
        <div style={{ fontSize: 64, marginBottom: "1rem" }}>🧩</div>

        <h2 style={{
          fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
          fontWeight: 900,
          color: "#1e293b",
          marginBottom: "0.5rem",
        }}>
          {level.learning_goal}
        </h2>

        <p style={{
          color: "#64748b",
          fontSize: 14,
          marginBottom: "0.5rem",
          maxWidth: 320,
          margin: "0 auto 1rem",
          lineHeight: 1.6,
        }}>
          {level.expected_behavior}
        </p>

        <p style={{
          color: "#94a3b8",
          fontSize: 13,
          marginBottom: "1.5rem",
        }}>
          Bu bölüm üzerinde çalışıyoruz. Çok yakında hazır olacak! ✨
        </p>

        <button
          type="button"
          onClick={() => {
            onAction({ type: "START_LEVEL" });
            setLastPosition(worldId, levelId);
          }}
          style={{
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "white",
            border: "none",
            borderRadius: "1rem",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 15,
            minHeight: "44px",
            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
          }}
        >
          🚀 Başla
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
    return <FailFeedback onRetry={() => onAction({ type: "RETRY" })} />;
  }

  if (!grid) return <p>No grid for this level</p>;

  const cellSize = Math.min(48, 40);
  const width = grid.cols * cellSize;
  const height = grid.rows * cellSize;

  const isObstacle = (x: number, y: number) =>
    grid.obstacles.some((o) => o.x === x && o.y === y);
  const isGoal = (x: number, y: number) =>
    grid.goal.x === x && grid.goal.y === y;
  const isPlayer = (x: number, y: number) =>
    grid.position.x === x && grid.position.y === y;

  return (
    <div style={{ padding: "0.5rem", maxWidth: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${grid.rows}, ${cellSize}px)`,
          width,
          height,
          maxWidth: "100%",
          border: "2px solid #333",
          margin: "0 auto",
        }}
      >
        {Array.from({ length: grid.rows * grid.cols }, (_, i) => {
          const x = i % grid.cols;
          const y = Math.floor(i / grid.cols);
          return (
            <div
              key={`${x}-${y}`}
              style={{
                width: cellSize,
                height: cellSize,
                background: isObstacle(x, y)
                  ? "#666"
                  : isGoal(x, y)
                    ? "#22c55e"
                    : "#f3f4f6",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: Math.min(20, cellSize * 0.45),
              }}
            >
              {isPlayer(x, y) ? "●" : null}
              {isGoal(x, y) && !isPlayer(x, y) ? "★" : null}
            </div>
          );
        })}
      </div>
      {phase === "play" && (
        <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          {/* D-pad */}
          <div style={{ display: "grid", gridTemplateColumns: "52px 52px 52px", gap: "0.35rem" }}>
            {/* Row 1: empty, UP, empty */}
            <div />
            <DPadBtn label="⬆️" onClick={() => onAction({ type: "EXECUTE_COMMAND", command: "UP" })} />
            <div />
            {/* Row 2: LEFT, center dot, RIGHT */}
            <DPadBtn label="⬅️" onClick={() => onAction({ type: "EXECUTE_COMMAND", command: "LEFT" })} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>●</div>
            <DPadBtn label="➡️" onClick={() => onAction({ type: "EXECUTE_COMMAND", command: "RIGHT" })} />
            {/* Row 3: empty, DOWN, empty */}
            <div />
            <DPadBtn label="⬇️" onClick={() => onAction({ type: "EXECUTE_COMMAND", command: "DOWN" })} />
            <div />
          </div>
          <button
            type="button"
            onClick={() => onAction({ type: "RESET_PLAY" })}
            style={{ marginTop: "0.5rem", padding: "0.5rem 1.25rem", background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: "0.75rem", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#64748b" }}
          >
            🔄 Sıfırla
          </button>
        </div>
      )}
      <p style={{ marginTop: "0.5rem", fontSize: 14, color: "#666", textAlign: "center" }}>
        Hamle: {commandHistory.length}
      </p>
      <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
        <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#666" }}>
          ← Dünya haritası
        </Link>
      </div>
    </div>
  );
}
