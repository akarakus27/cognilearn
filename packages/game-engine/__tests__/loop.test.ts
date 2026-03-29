import { describe, it, expect } from "vitest";
import { Engine, expandInstructions } from "../src/index";
import type { LevelSchema } from "@cognitive/content-schema";
import type { LoopInstruction } from "../src/types";

// ─── expandInstructions ───────────────────────────────────────────────────────

describe("expandInstructions", () => {
  it("expands a single GridCommand unchanged", () => {
    expect(expandInstructions(["RIGHT"])).toEqual(["RIGHT"]);
  });

  it("expands REPEAT(3){RIGHT} to three RIGHTs", () => {
    const inst: LoopInstruction[] = [
      { type: "REPEAT", count: 3, body: ["RIGHT"] },
    ];
    expect(expandInstructions(inst)).toEqual(["RIGHT", "RIGHT", "RIGHT"]);
  });

  it("expands REPEAT(2){RIGHT,DOWN}", () => {
    const inst: LoopInstruction[] = [
      { type: "REPEAT", count: 2, body: ["RIGHT", "DOWN"] },
    ];
    expect(expandInstructions(inst)).toEqual(["RIGHT", "DOWN", "RIGHT", "DOWN"]);
  });

  it("expands mixed commands and loop blocks", () => {
    const inst: LoopInstruction[] = [
      "UP",
      { type: "REPEAT", count: 2, body: ["RIGHT"] },
      "DOWN",
    ];
    expect(expandInstructions(inst)).toEqual(["UP", "RIGHT", "RIGHT", "DOWN"]);
  });

  it("returns empty array for empty input", () => {
    expect(expandInstructions([])).toEqual([]);
  });

  it("handles REPEAT(1) as identity", () => {
    const inst: LoopInstruction[] = [{ type: "REPEAT", count: 1, body: ["LEFT"] }];
    expect(expandInstructions(inst)).toEqual(["LEFT"]);
  });
});

// ─── Engine RUN_LOOP ──────────────────────────────────────────────────────────

const loopLevel: LevelSchema = {
  id: "algorithm/level-201",
  mode: "loop",
  skill_target: "loops",
  difficulty: 1,
  learning_goal: "Use a loop",
  expected_behavior: "REPEAT(3){RIGHT}",
  grid: {
    rows: 1,
    cols: 4,
    start: { x: 0, y: 0 },
    goal: { x: 3, y: 0 },
  },
  solution: [{ type: "REPEAT", count: 3, body: ["RIGHT"] }],
};

describe("Engine RUN_LOOP", () => {
  it("transitions to success when loop reaches goal", () => {
    const engine = new Engine();
    engine.loadLevel(loopLevel);
    engine.executeAction({ type: "START_LEVEL" });
    engine.executeAction({
      type: "RUN_LOOP",
      instructions: [{ type: "REPEAT", count: 3, body: ["RIGHT"] }],
    });
    expect(engine.getState().phase).toBe("success");
  });

  it("transitions to fail when loop misses goal", () => {
    const engine = new Engine();
    engine.loadLevel(loopLevel);
    engine.executeAction({ type: "START_LEVEL" });
    engine.executeAction({
      type: "RUN_LOOP",
      instructions: [{ type: "REPEAT", count: 2, body: ["RIGHT"] }],
    });
    expect(engine.getState().phase).toBe("fail");
  });

  it("records flat commands in commandHistory", () => {
    const engine = new Engine();
    engine.loadLevel(loopLevel);
    engine.executeAction({ type: "START_LEVEL" });
    engine.executeAction({
      type: "RUN_LOOP",
      instructions: [{ type: "REPEAT", count: 3, body: ["RIGHT"] }],
    });
    expect(engine.getState().commandHistory).toEqual(["RIGHT", "RIGHT", "RIGHT"]);
  });

  it("RETRY after fail resets to play phase", () => {
    const engine = new Engine();
    engine.loadLevel(loopLevel);
    engine.executeAction({ type: "START_LEVEL" });
    engine.executeAction({
      type: "RUN_LOOP",
      instructions: [{ type: "REPEAT", count: 1, body: ["DOWN"] }],
    });
    expect(engine.getState().phase).toBe("fail");
    engine.executeAction({ type: "RETRY" });
    expect(engine.getState().phase).toBe("play");
    expect(engine.getState().commandHistory).toEqual([]);
  });

  it("mixed instructions: command + loop", () => {
    const mixedLevel: LevelSchema = {
      ...loopLevel,
      grid: { rows: 2, cols: 3, start: { x: 0, y: 0 }, goal: { x: 2, y: 1 } },
      solution: [{ type: "REPEAT", count: 2, body: ["RIGHT"] }, "DOWN"],
    };
    const engine = new Engine();
    engine.loadLevel(mixedLevel);
    engine.executeAction({ type: "START_LEVEL" });
    engine.executeAction({
      type: "RUN_LOOP",
      instructions: [{ type: "REPEAT", count: 2, body: ["RIGHT"] }, "DOWN"],
    });
    expect(engine.getState().phase).toBe("success");
  });
});
