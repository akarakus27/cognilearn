import type { LevelSchema } from "@cognitive/content-schema";

/** Grid movement commands for algorithmic puzzles */
export type GridCommand = "UP" | "DOWN" | "LEFT" | "RIGHT";

/** A REPEAT block: run body commands count times */
export interface RepeatBlock {
  type: "REPEAT";
  count: number;
  body: GridCommand[];
}

/** Loop-mode instruction: either a direct command or a repeat block */
export type LoopInstruction = GridCommand | RepeatBlock;

/** Conditions that can be checked at runtime */
export type Condition =
  | "WALL_AHEAD"
  | "WALL_RIGHT"
  | "WALL_LEFT"
  | "WALL_BEHIND"
  | "CLEAR_AHEAD"
  | "GOAL_AHEAD";

/** Direction the robot is currently facing */
export type Direction = "RIGHT" | "LEFT" | "UP" | "DOWN";

/** IF block: check condition, run then-branch or else-branch */
export interface IfBlock {
  type: "IF";
  condition: Condition;
  then: GridCommand[];
  else?: GridCommand[];
}

/** Conditional-mode instruction */
export type ConditionalInstruction = GridCommand | RepeatBlock | IfBlock;

/** Robot state for conditional simulation */
export interface RobotState {
  x: number;
  y: number;
  facing: Direction;
}

/** Action sent from UI to engine */
export type Action =
  | { type: "START_LEVEL" }
  | { type: "EXECUTE_COMMAND"; command: GridCommand }
  | { type: "RUN_SEQUENCE"; commands: GridCommand[] }
  | { type: "RUN_LOOP"; instructions: LoopInstruction[] }
  | { type: "RUN_CONDITIONAL"; instructions: ConditionalInstruction[]; facing: Direction }
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
