import { describe, it, expect } from "vitest";
import { computeStars, computeXp, computeReward } from "../src/reward";
import type { LevelSchema } from "@cognitive/content-schema";

const baseLevel: LevelSchema = {
  id: "t",
  skill_target: "s",
  difficulty: 2,
  learning_goal: "g",
  expected_behavior: "e",
  solution: ["RIGHT", "RIGHT"],
};

describe("Reward Engine", () => {
  it("computes 3 stars at optimal moves", () => {
    expect(computeStars(baseLevel, ["RIGHT", "RIGHT"])).toBe(3);
  });

  it("computes 2 stars within +2 of optimal", () => {
    expect(computeStars(baseLevel, ["RIGHT", "RIGHT", "DOWN", "UP"])).toBe(2);
  });

  it("computes 1 star for longer paths", () => {
    expect(
      computeStars(baseLevel, ["RIGHT", "RIGHT", "DOWN", "UP", "DOWN", "UP"])
    ).toBe(1);
  });

  it("computeXp scales with stars and difficulty", () => {
    expect(computeXp(3, 2)).toBeGreaterThan(computeXp(1, 1));
  });

  it("computeReward returns stars and xp", () => {
    const r = computeReward(baseLevel, ["RIGHT", "RIGHT"]);
    expect(r.stars).toBe(3);
    expect(r.xp).toBeGreaterThan(0);
  });
});
