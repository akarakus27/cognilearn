import { describe, it, expect } from "vitest";
import { encodeProgress, decodeProgress } from "../src/progress-codec";
import type { Progress } from "../src/progress";

describe("Progress Code", () => {
  it("round-trips encode → decode", () => {
    const p: Progress = {
      completedLevels: { "algorithm/level-001": 3, "algorithm/level-002": 2 },
      xp: 42,
      lastLevelId: "algorithm/level-002",
      lastWorldId: "1",
    };
    const code = encodeProgress(p);
    const out = decodeProgress(code);
    expect(out.completedLevels).toEqual(p.completedLevels);
    expect(out.xp).toBe(p.xp);
    expect(out.lastLevelId).toBe(p.lastLevelId);
    expect(out.lastWorldId).toBe(p.lastWorldId);
  });

  it("rejects invalid prefix", () => {
    expect(() => decodeProgress("bad")).toThrow();
  });
});
