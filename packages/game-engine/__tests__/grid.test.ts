import { describe, it, expect } from "vitest";
import {
  createGridState,
  isValidCell,
  applyCommand,
  isAtGoal,
} from "../src/grid";

describe("Grid Engine", () => {
  it("creates grid from level schema", () => {
    const grid = createGridState({
      grid: { rows: 5, cols: 5 },
    });
    expect(grid).not.toBeNull();
    expect(grid!.rows).toBe(5);
    expect(grid!.cols).toBe(5);
    expect(grid!.position).toEqual({ x: 0, y: 0 });
    expect(grid!.goal).toEqual({ x: 4, y: 4 });
  });

  it("validates cell bounds", () => {
    const grid = createGridState({ grid: { rows: 3, cols: 4 } })!;
    expect(isValidCell(grid, 0, 0)).toBe(true);
    expect(isValidCell(grid, 3, 2)).toBe(true);
    expect(isValidCell(grid, -1, 0)).toBe(false);
    expect(isValidCell(grid, 4, 0)).toBe(false);
    expect(isValidCell(grid, 0, 3)).toBe(false);
  });

  it("applies RIGHT command", () => {
    const grid = createGridState({ grid: { rows: 3, cols: 3 } })!;
    const next = applyCommand(grid, "RIGHT");
    expect(next.position).toEqual({ x: 1, y: 0 });
  });

  it("applies DOWN command", () => {
    const grid = createGridState({ grid: { rows: 3, cols: 3 } })!;
    const next = applyCommand(grid, "DOWN");
    expect(next.position).toEqual({ x: 0, y: 1 });
  });

  it("blocks movement into obstacle", () => {
    const grid = createGridState({
      grid: {
        rows: 3,
        cols: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        obstacles: [{ x: 1, y: 0 }],
      },
    })!;
    const next = applyCommand(grid, "RIGHT");
    expect(next.position).toEqual({ x: 0, y: 0 });
  });

  it("blocks movement out of bounds", () => {
    const grid = createGridState({
      grid: { rows: 2, cols: 2, start: { x: 0, y: 0 } },
    })!;
    const next = applyCommand(grid, "LEFT");
    expect(next.position).toEqual({ x: 0, y: 0 });
  });

  it("detects goal", () => {
    const grid = createGridState({
      grid: { rows: 2, cols: 2, start: { x: 1, y: 1 }, goal: { x: 1, y: 1 } },
    })!;
    expect(isAtGoal(grid)).toBe(true);
  });
});
