import { describe, it, expect } from "vitest";
import { validate } from "../src/validator";
import type { LevelSchema } from "@cognitive/content-schema";

describe("Puzzle Validator", () => {
  const levelWithGrid: LevelSchema = {
    id: "test-1",
    skill_target: "sequences",
    difficulty: 1,
    learning_goal: "Reach the goal",
    expected_behavior: "Use RIGHT, RIGHT, DOWN",
    grid: {
      rows: 3,
      cols: 3,
      start: { x: 0, y: 0 },
      goal: { x: 2, y: 1 },
    },
    solution: ["RIGHT", "RIGHT", "DOWN"],
  };

  it("returns valid when goal reached with correct solution", () => {
    const result = validate(levelWithGrid, ["RIGHT", "RIGHT", "DOWN"]);
    expect(result.valid).toBe(true);
    expect(result.feedback).toBeUndefined();
  });

  it("returns valid when goal reached with different path", () => {
    const result = validate(levelWithGrid, ["RIGHT", "DOWN", "RIGHT"]);
    expect(result.valid).toBe(true);
  });

  it("returns invalid when goal not reached", () => {
    const result = validate(levelWithGrid, ["RIGHT", "LEFT"]);
    expect(result.valid).toBe(false);
    expect(result.feedback).toContain("goal");
  });

  it("returns invalid for level with no grid", () => {
    const noGrid: LevelSchema = {
      ...levelWithGrid,
      grid: undefined,
    };
    const result = validate(noGrid, []);
    expect(result.valid).toBe(false);
    expect(result.feedback).toContain("grid");
  });
});
