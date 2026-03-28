"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordCompletion } from "@cognitive/utils";
import type { LevelSchema } from "@cognitive/content-schema";
import { PIECE_DATA, MOVE_DATA, type PieceName } from "./pieceData";

interface Props {
  level: LevelSchema;
  nextHref: string | null;
  worldHref: string;
}

const CELL = 64;

type Pos = { x: number; y: number };

function getValidMoves(piece: PieceName, pos: Pos, boardSize: number): Pos[] {
  const moves: Pos[] = [];
  const inBounds = (x: number, y: number) => x >= 0 && x < boardSize && y >= 0 && y < boardSize;

  switch (piece) {
    case "pawn":
      if (inBounds(pos.x, pos.y - 1)) moves.push({ x: pos.x, y: pos.y - 1 });
      if (pos.y === boardSize - 2 && inBounds(pos.x, pos.y - 2)) moves.push({ x: pos.x, y: pos.y - 2 });
      break;
    case "rook":
      for (let i = 0; i < boardSize; i++) {
        if (i !== pos.x) moves.push({ x: i, y: pos.y });
        if (i !== pos.y) moves.push({ x: pos.x, y: i });
      }
      break;
    case "knight": {
      const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dx, dy] of knightMoves) {
        const nx = pos.x + dx!, ny = pos.y + dy!;
        if (inBounds(nx, ny)) moves.push({ x: nx, y: ny });
      }
      break;
    }
    case "bishop":
      for (let d = 1; d < boardSize; d++) {
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dx, dy]) => {
          const nx = pos.x + dx! * d, ny = pos.y + dy! * d;
          if (inBounds(nx, ny)) moves.push({ x: nx, y: ny });
        });
      }
      break;
    case "queen":
      for (let i = 0; i < boardSize; i++) {
        if (i !== pos.x) moves.push({ x: i, y: pos.y });
        if (i !== pos.y) moves.push({ x: pos.x, y: i });
      }
      for (let d = 1; d < boardSize; d++) {
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dx, dy]) => {
          const nx = pos.x + dx! * d, ny = pos.y + dy! * d;
          if (inBounds(nx, ny)) moves.push({ x: nx, y: ny });
        });
      }
      break;
    case "king":
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dx, dy]) => {
        const nx = pos.x + dx!, ny = pos.y + dy!;
        if (inBounds(nx, ny)) moves.push({ x: nx, y: ny });
      });
      break;
  }
  return moves;
}

export function ChessSimulateCanvas({ level, nextHref, worldHref }: Props) {
  const router = useRouter();
  const piece = (level.meta as unknown as { piece: PieceName }).piece;
  const pieceInfo = PIECE_DATA[piece];
  const moveInfo = MOVE_DATA[piece];
  const boardSize = moveInfo.boardSize;

  const [pos, setPos] = useState<Pos>(moveInfo.startPos);
  const [selected, setSelected] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [done, setDone] = useState(false);
  const [success, setSuccess] = useState(false);

  // Goal: last step destination
  const goal = moveInfo.steps[moveInfo.steps.length - 1]!.to;

  const validMoves = selected ? getValidMoves(piece, pos, boardSize) : [];
  const validSet = new Set(validMoves.map((m) => `${m.x},${m.y}`));
  const isGoal = (x: number, y: number) => goal.x === x && goal.y === y;
  const isPlayer = (x: number, y: number) => pos.x === x && pos.y === y;

  const handleCellClick = (x: number, y: number) => {
    if (done) return;
    if (isPlayer(x, y)) {
      setSelected((s) => !s);
      return;
    }
    if (selected && validSet.has(`${x},${y}`)) {
      const newPos = { x, y };
      setPos(newPos);
      setMoveCount((c) => c + 1);
      setSelected(false);
      if (isGoal(x, y)) {
        setSuccess(true);
        setDone(true);
        recordCompletion(level.id, 3, 60);
        setTimeout(() => router.push(nextHref ?? worldHref), 1800);
      }
    } else {
      setSelected(false);
    }
  };

  const handleReset = () => {
    setPos(moveInfo.startPos);
    setSelected(false);
    setMoveCount(0);
    setDone(false);
    setSuccess(false);
  };

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
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>Simülasyon</div>
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900 }}>{pieceInfo.name}</h2>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{moveInfo.ruleTitle}</div>
        </div>
      </div>

      {/* Instruction */}
      <div style={{
        background: "#f0fdf4", border: "2px solid #86efac",
        borderRadius: "1rem", padding: "0.75rem 1rem",
        fontSize: 13, fontWeight: 700, color: "#166534",
        marginBottom: "1rem", textAlign: "center",
      }}>
        {success
          ? "🎉 Harika! Hedefe ulaştın!"
          : selected
          ? "✅ Yeşil bir kareye tıklayarak taşı hareket ettir!"
          : "👆 Taşa tıkla, ardından gitmek istediğin kareyi seç!"}
      </div>

      {/* Board */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
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
            const isValid = validSet.has(`${x},${y}`);
            const isGoalCell = isGoal(x, y);
            const isPlayerCell = isPlayer(x, y);

            let bg = isLight ? "#f0d9b5" : "#b58863";
            if (isGoalCell && !isPlayerCell) bg = isLight ? "#bbf7d0" : "#86efac";
            if (isValid) bg = isLight ? "#d9f99d" : "#a3e635";
            if (isPlayerCell && selected) bg = isLight ? "#fef08a" : "#facc15";

            return (
              <div
                key={i}
                onClick={() => handleCellClick(x, y)}
                style={{
                  width: CELL, height: CELL,
                  background: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: (isPlayerCell || isValid) && !done ? "pointer" : "default",
                  fontSize: isPlayerCell ? 36 : 20,
                  transition: "background 0.15s",
                  position: "relative",
                  userSelect: "none",
                }}
              >
                {isPlayerCell && (
                  <span style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                    transition: "transform 0.2s",
                    transform: selected ? "scale(1.15)" : "scale(1)",
                  }}>
                    {pieceInfo.symbol}
                  </span>
                )}
                {isGoalCell && !isPlayerCell && (
                  <span style={{ fontSize: 28, opacity: 0.7 }}>⭐</span>
                )}
                {isValid && !isPlayerCell && (
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(22,101,52,0.55)",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: "0.75rem", justifyContent: "center",
        marginBottom: "1rem",
      }}>
        <div style={{
          background: "white", border: "2px solid #e2e8f0",
          borderRadius: "0.875rem", padding: "0.5rem 1rem",
          fontSize: 13, fontWeight: 700, color: "#475569",
          display: "flex", alignItems: "center", gap: "0.4rem",
        }}>
          🎯 Hedef: ({goal.x},{goal.y})
        </div>
        <div style={{
          background: "white", border: "2px solid #e2e8f0",
          borderRadius: "0.875rem", padding: "0.5rem 1rem",
          fontSize: 13, fontWeight: 700, color: "#475569",
          display: "flex", alignItems: "center", gap: "0.4rem",
        }}>
          👣 Hamle: {moveCount}
        </div>
      </div>

      {/* Rules */}
      <div style={{
        background: "#f8fafc", border: "2px solid #e2e8f0",
        borderRadius: "1rem", padding: "0.875rem 1rem",
        marginBottom: "1rem",
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: "0.5rem" }}>
          📖 Kurallar
        </div>
        {moveInfo.rules.map((rule, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: "0.25rem",
          }}>
            <span style={{ color: pieceInfo.color, fontSize: 16 }}>✓</span>
            {rule}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
            color: "#475569", border: "none", borderRadius: "0.875rem",
            cursor: "pointer", fontWeight: 800, fontSize: 14, minHeight: "44px",
          }}
        >
          🔄 Sıfırla
        </button>

        {success && (
          <button
            type="button"
            onClick={() => router.push(nextHref ?? worldHref)}
            style={{
              padding: "0.75rem 1.5rem",
              background: pieceInfo.gradient,
              color: "white", border: "none", borderRadius: "0.875rem",
              cursor: "pointer", fontWeight: 800, fontSize: 14, minHeight: "44px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            }}
          >
            Devam Et →
          </button>
        )}
      </div>
    </div>
  );
}
