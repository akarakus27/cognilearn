/** Universal level schema — all level types conform */
export interface LevelSchema {
  id: string;
  skill_target: string;
  difficulty: number;
  learning_goal: string;
  expected_behavior: string;
  /** "step" = move one at a time (default), "sequence" = build queue then run */
  mode?: "step" | "sequence";
  /** Grid config for algorithmic/unplugged puzzles */
  grid?: {
    rows: number;
    cols: number;
    start?: { x: number; y: number };
    goal?: { x: number; y: number };
    obstacles?: Array<{ x: number; y: number }>;
  };
  /** Solution: expected command sequence or puzzle answer */
  solution?: unknown;
  /** Extra config per level type */
  meta?: Record<string, unknown>;
}
