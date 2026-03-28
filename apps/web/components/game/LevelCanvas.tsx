"use client";

import Link from "next/link";
import { computeReward } from "@cognitive/game-engine";
import type { EngineState, GridCommand, Action } from "@cognitive/game-engine";
import { setLastPosition } from "@cognitive/utils";
import { SuccessFeedback } from "./SuccessFeedback";
import { FailFeedback } from "./FailFeedback";
import { SequenceCanvas } from "./SequenceCanvas";

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
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.1rem, 3vw, 1.35rem)" }}>{level.learning_goal}</h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>{level.expected_behavior}</p>
        <button
          type="button"
          onClick={() => {
            onAction({ type: "START_LEVEL" });
            setLastPosition(worldId, levelId);
          }}
          style={{
            padding: "0.65rem 1.25rem",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: 600,
            minHeight: "44px",
          }}
        >
          Start
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
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          {(["UP", "DOWN", "LEFT", "RIGHT"] as GridCommand[]).map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => onAction({ type: "EXECUTE_COMMAND", command: cmd })}
              style={{
                padding: "0.5rem 0.75rem",
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                cursor: "pointer",
                minHeight: "44px",
                minWidth: "44px",
              }}
            >
              {cmd}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onAction({ type: "RESET_PLAY" })}
            style={{
              padding: "0.5rem 0.75rem",
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              cursor: "pointer",
              minHeight: "44px",
            }}
          >
            Reset moves
          </button>
        </div>
      )}
      <p style={{ marginTop: "0.5rem", fontSize: 14, color: "#666", textAlign: "center" }}>
        Moves: {commandHistory.length}
      </p>
      <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
        <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#666" }}>
          ← World map
        </Link>
      </div>
    </div>
  );
}
