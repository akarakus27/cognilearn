"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordCompletion } from "@cognitive/utils";
import type { LevelSchema } from "@cognitive/content-schema";
import { PIECE_DATA, type PieceName } from "./pieceData";
import { getValidMoves, posKey, type Pos } from "./chessUtils";

interface CaptureMeta {
  piece: PieceName;
  boardSize: number;
  playerPos: Pos;
  opponents: Pos[];
  task: string;
}

interface Props {
  level: LevelSchema;
  nextHref: string | null;
  worldHref: string;
}

const CELL = 64;

export function ChessCaptureCanvas({ level, nextHref, worldHref }: Props) {
  const router = useRouter();
  const meta = level.meta as unknown as CaptureMeta;
  const { piece, boardSize, task } = meta;
  const pieceInfo = PIECE_DATA[piece];

  const [playerPos, setPlayerPos] = useState<Pos>(meta.playerPos);
  const [opponents, setOpponents] = useState<Pos[]>(meta.opponents);
  const [selected, setSelected] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const validMoves = selected
    ? getValidMoves(piece, playerPos, boardSize, [], opponents)
    : [];
  const validSet = new Set(validMoves.map(posKey));
  const opponentSet = new Set(opponents.map(posKey));

  const isPlayer = (x: number, y: number) => playerPos.x === x && playerPos.y === y;
  const isOpponent = (x: number, y: number) => opponentSet.has(`${x},${y}`);
  const isValid = (x: number, y: number) => validSet.has(`${x},${y}`);

  const handleCell = (x: number, y: number) => {
    if (success) return;
    if (isPlayer(x, y)) { setSelected((s) => !s); return; }
    if (!selected) return;

    if (isValid(x, y)) {
      const captured = isOpponent(x, y);
      setPlayerPos({ x, y });
      if (captured) {
        const remaining = opponents.filter((o) => !(o.x === x && o.y === y));
        setOpponents(remaining);
        if (remaining.length === 0) {
          setSuccess(true);
          setMessage("🎯 Tüm taşları yedin! Harika!");
          recordCompletion(level.id, 3, 60);
          setTimeout(() => router.push(nextHref ?? worldHref), 1800);
        } else {
          setMessage(`🎯 Yakaladın! ${remaining.length} taş kaldı.`);
        }
      }
      setSelected(false);
    } else {
      setSelected(false);
      setMessage("");
    }
  };

  const handleReset = () => {
    setPlayerPos(meta.playerPos);
    setOpponents(meta.opponents);
    setSelected(false);
    setSuccess(false);
    setMessage("");
  };

  return (
    <div style={{ fontFamily: "Nunito, system-ui, sans-serif", maxWidth: 560, margin: "0 auto", padding: "0.5rem" }}>
      {/* Header */}
      <div style={{
        background: pieceInfo.gradient, borderRadius: "1.25rem",
        padding: "1rem 1.25rem", color: "white", marginBottom: "1rem",
        display: "flex", alignItems: "center", gap: "0.875rem",
      }}>
        <div style={{ width: 52, height: 52, borderRadius: "0.875rem", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          {pieceInfo.symbol}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>Taş Yeme</div>
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900 }}>{pieceInfo.name} ile Ye!</h2>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{task}</div>
        </div>
      </div>

      {/* Status */}
      <div style={{
        background: success ? "#f0fdf4" : "#fefce8",
        border: `2px solid ${success ? "#86efac" : "#fde047"}`,
        borderRadius: "1rem", padding: "0.75rem 1rem",
        fontSize: 13, fontWeight: 700,
        color: success ? "#166534" : "#854d0e",
        marginBottom: "1rem", textAlign: "center",
      }}>
        {message || (selected
          ? "✅ Kırmızı taşa tıkla — ye onu!"
          : "👆 Beyaz taşa tıkla, sonra kırmızı taşı yakala!")}
      </div>

      {/* Board */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${boardSize}, ${CELL}px)`,
          gridTemplateRows: `repeat(${boardSize}, ${CELL}px)`,
          border: "3px solid #1e293b", borderRadius: "0.75rem",
          overflow: "hidden", boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
        }}>
          {Array.from({ length: boardSize * boardSize }, (_, i) => {
            const x = i % boardSize, y = Math.floor(i / boardSize);
            const isLight = (x + y) % 2 === 0;
            const player = isPlayer(x, y);
            const opp = isOpponent(x, y);
            const valid = isValid(x, y);

            let bg = isLight ? "#f0d9b5" : "#b58863";
            if (valid && opp) bg = isLight ? "#fecaca" : "#f87171";
            else if (valid) bg = isLight ? "#d9f99d" : "#a3e635";
            if (player && selected) bg = isLight ? "#fef08a" : "#facc15";

            return (
              <div key={i} onClick={() => handleCell(x, y)} style={{
                width: CELL, height: CELL, background: bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: (player || valid) && !success ? "pointer" : "default",
                fontSize: 32, transition: "background 0.15s", userSelect: "none",
              }}>
                {player && <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))", transform: selected ? "scale(1.15)" : "scale(1)", transition: "transform 0.15s" }}>{pieceInfo.symbol}</span>}
                {opp && !player && <span style={{ fontSize: 30, opacity: 0.9 }}>♟</span>}
                {valid && !opp && !player && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(22,101,52,0.5)" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: "1rem" }}>
        Kalan taş: {opponents.length}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button type="button" onClick={handleReset} style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)", color: "#475569", border: "none", borderRadius: "0.875rem", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>
          🔄 Sıfırla
        </button>
        {success && (
          <button type="button" onClick={() => router.push(nextHref ?? worldHref)} style={{ padding: "0.75rem 1.5rem", background: pieceInfo.gradient, color: "white", border: "none", borderRadius: "0.875rem", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>
            Devam Et →
          </button>
        )}
      </div>
    </div>
  );
}
