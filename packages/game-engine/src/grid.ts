import type { GridState, GridCommand } from "./types";

/** Check if (x, y) is within grid bounds */
export function isValidCell(grid: GridState, x: number, y: number): boolean {
  return x >= 0 && x < grid.cols && y >= 0 && y < grid.rows;
}

/** Check if cell is blocked by obstacle */
export function isObstacle(grid: GridState, x: number, y: number): boolean {
  return grid.obstacles.some((o) => o.x === x && o.y === y);
}

/** Check if position is the goal */
export function isAtGoal(grid: GridState): boolean {
  return (
    grid.position.x === grid.goal.x && grid.position.y === grid.goal.y
  );
}

/** Compute new position after command (does not mutate) */
export function applyCommand(
  grid: GridState,
  command: GridCommand
): GridState {
  let { x, y } = grid.position;
  switch (command) {
    case "UP":
      y -= 1;
      break;
    case "DOWN":
      y += 1;
      break;
    case "LEFT":
      x -= 1;
      break;
    case "RIGHT":
      x += 1;
      break;
  }
  if (!isValidCell(grid, x, y) || isObstacle(grid, x, y)) {
    return grid;
  }
  return {
    ...grid,
    position: { x, y },
  };
}

/** Create grid state from level schema */
export function createGridState(level: {
  grid?: {
    rows: number;
    cols: number;
    start?: { x: number; y: number };
    goal?: { x: number; y: number };
    obstacles?: Array<{ x: number; y: number }>;
  };
}): GridState | null {
  const g = level.grid;
  if (!g) return null;
  const rows = g.rows ?? 5;
  const cols = g.cols ?? 5;
  const start = g.start ?? { x: 0, y: 0 };
  const goal = g.goal ?? { x: cols - 1, y: rows - 1 };
  const obstacles = g.obstacles ?? [];
  return {
    rows,
    cols,
    position: { ...start },
    goal: { ...goal },
    obstacles: [...obstacles],
  };
}
