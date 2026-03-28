import type { LevelSchema } from "@cognitive/content-schema";

/** Grid movement commands for algorithmic puzzles */
export type GridCommand = "UP" | "DOWN" | "LEFT" | "RIGHT";

/** Action sent from UI to engine */
export type Action =
  | { type: "START_LEVEL" }
  | { type: "EXECUTE_COMMAND"; command: GridCommand }
  | { type: "RUN_SEQUENCE"; commands: GridCommand[] }
  | { type: "RETRY" }
  | { type: "RESET_PLAY" };

export type LevelPhase = "intro" | "play" | "success" | "fail";

export interface ValidationResult {
  valid: boolean;
  feedback?: string;
}

export interface GridState {
  rows: number;
  cols: number;
  position: { x: number; y: number };
  goal: { x: number; y: number };
  obstacles: Array<{ x: number; y: number }>;
}

export interface EngineState {
  level: LevelSchema | null;
  grid: GridState | null;
  phase: LevelPhase;
  commandHistory: GridCommand[];
}
