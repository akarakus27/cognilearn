import type { LevelSchema } from "@cognitive/content-schema";
import type { GridCommand, LoopInstruction } from "./types";

export interface RewardResult {
  stars: 1 | 2 | 3;
  xp: number;
}

/** Optimal move count from level solution (flat commands or loop instructions) */
function optimalMoves(level: LevelSchema): number {
  const sol = level.solution as GridCommand[] | LoopInstruction[] | undefined;
  if (!Array.isArray(sol)) return 1;
  // If it's a loop solution, count top-level blocks
  const first = sol[0];
  if (first && typeof first === "object" && "type" in first) {
    return (sol as LoopInstruction[]).length;
  }
  return (sol as GridCommand[]).length;
}

/**
 * Stars: 3 = at or under optimal moves, 2 = within +2, 1 = reached goal (longer path).
 */
export function computeStars(
  level: LevelSchema,
  commandHistory: GridCommand[]
): 1 | 2 | 3 {
  const actual = commandHistory.length;
  const opt = Math.max(1, optimalMoves(level));
  if (actual <= opt) return 3;
  if (actual <= opt + 2) return 2;
  return 1;
}

/** XP: base from stars + small bonus from difficulty */
export function computeXp(
  stars: 1 | 2 | 3,
  difficulty: number
): number {
  const base = stars * 10;
  const bonus = Math.min(5, Math.max(0, difficulty));
  return base + bonus;
}

export function computeReward(
  level: LevelSchema,
  commandHistory: GridCommand[]
): RewardResult {
  const stars = computeStars(level, commandHistory);
  const xp = computeXp(stars, level.difficulty);
  return { stars, xp };
}
