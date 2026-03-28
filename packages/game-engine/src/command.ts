import type { GridState, GridCommand } from "./types";
import { applyCommand, isAtGoal } from "./grid";

export interface CommandResult {
  grid: GridState;
  reachedGoal: boolean;
}

/** Execute a single command; return updated grid */
export function executeCommand(
  grid: GridState,
  command: GridCommand
): CommandResult {
  const nextGrid = applyCommand(grid, command);
  return {
    grid: nextGrid,
    reachedGoal: isAtGoal(nextGrid),
  };
}

/** Execute sequence of commands; return final grid and whether goal was reached */
export function runSequence(
  grid: GridState,
  commands: GridCommand[]
): CommandResult {
  let current = grid;
  for (const cmd of commands) {
    const result = executeCommand(current, cmd);
    current = result.grid;
    if (result.reachedGoal) {
      return { grid: current, reachedGoal: true };
    }
  }
  return { grid: current, reachedGoal: isAtGoal(current) };
}
