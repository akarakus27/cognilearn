import type { LevelSchema } from "@cognitive/content-schema";
import type { GridCommand } from "./types";

export interface RewardResult {
  stars: 1 | 2 | 3;
  xp: number;
}

/** Optimal move count from level solution */
function optimalMoves(level: LevelSchema): number {
  const sol = level.solution as GridCommand[] | undefined;
  return Array.isArray(sol) ? sol.length : 1;
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
