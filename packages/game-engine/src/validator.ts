import type { ValidationResult } from "./types";
import type { GridCommand } from "./types";
import { runSequence } from "./command";
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

/** Check if user commands match expected (order and content) */
function matchesSolution(
  user: GridCommand[],
  expected: GridCommand[]
): boolean {
  if (user.length !== expected.length) return false;
  return user.every((c, i) => c === expected[i]);
}
