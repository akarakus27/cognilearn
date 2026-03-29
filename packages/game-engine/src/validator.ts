import type { ValidationResult, GridCommand, LoopInstruction, ConditionalInstruction, Direction } from "./types";
import { runSequence, expandInstructions, simulateConditional } from "./command";
import { createGridState } from "./grid";
import type { LevelSchema } from "@cognitive/content-schema";

/** Compare user solution vs expected; return valid + optional feedback */
export function validate(
  level: LevelSchema,
  userCommands: GridCommand[]
): ValidationResult {
  const grid = createGridState(level);
  if (!grid) {
    return { valid: false, feedback: "Level has no grid" };
  }
  const { reachedGoal } = runSequence(grid, userCommands);
  if (!reachedGoal) {
    return { valid: false, feedback: "Did not reach the goal" };
  }
  const expected = level.solution as GridCommand[] | undefined;
  if (expected && !matchesSolution(userCommands, expected)) {
    return {
      valid: true,
      feedback: "Goal reached! Try a shorter path next time.",
    };
  }
  return { valid: true };
}

/** Validate loop-mode: expand instructions, simulate, check goal */
export function validateLoop(
  level: LevelSchema,
  instructions: LoopInstruction[]
): ValidationResult {
  const grid = createGridState(level);
  if (!grid) {
    return { valid: false, feedback: "Level has no grid" };
  }
  const flat = expandInstructions(instructions);
  const { reachedGoal } = runSequence(grid, flat);
  if (!reachedGoal) {
    return { valid: false, feedback: "Did not reach the goal" };
  }
  return { valid: true };
}

/** Validate conditional-mode: simulate with robot direction, check goal */
export function validateConditional(
  level: LevelSchema,
  instructions: ConditionalInstruction[],
  facing: Direction
): ValidationResult {
  const grid = createGridState(level);
  if (!grid) return { valid: false, feedback: "Level has no grid" };
  const { reachedGoal } = simulateConditional(instructions, grid, facing);
  if (!reachedGoal) return { valid: false, feedback: "Did not reach the goal" };
  return { valid: true };
}

/** Check if user commands match expected (order and content) */
function matchesSolution(
  user: GridCommand[],
  expected: GridCommand[]
): boolean {
  if (user.length !== expected.length) return false;
  return user.every((c, i) => c === expected[i]);
}
