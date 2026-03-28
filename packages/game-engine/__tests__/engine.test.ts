import { describe, it, expect } from "vitest";
import { Engine } from "../src/index";
import type { LevelSchema } from "@cognitive/content-schema";

describe("Engine loadLevel, executeAction, getState", () => {
  const level: LevelSchema = {
    id: "algorithm/level-001",
    skill_target: "sequences",
    difficulty: 1,
    learning_goal: "Reach the goal",
    expected_behavior: "Use commands",
    grid: {
      rows: 3,
      cols: 3,
      start: { x: 0, y: 0 },
      goal: { x: 2, y: 0 },
    },
    solution: ["RIGHT", "RIGHT"],
  };

  it("loadLevel returns initial state", () => {
    const engine = new Engine();
    const state = engine.loadLevel(level);
    expect(state.level).not.toBeNull();
    expect(state.level!.id).toBe("algorithm/level-001");
    expect(state.grid).not.toBeNull();
    expect(state.grid!.position).toEqual({ x: 0, y: 0 });
    expect(state.phase).toBe("intro");
    expect(state.commandHistory).toEqual([]);
  });

  it("executeAction START_LEVEL transitions intro -> play", () => {
    const engine = new Engine();
    engine.loadLevel(level);
    engine.executeAction({ type: "START_LEVEL" });
    const state = engine.getState();
    expect(state.phase).toBe("play");
  });

  it("executeAction EXECUTE_COMMAND updates grid and history", () => {
    const engine = new Engine();
    engine.loadLevel(level);
    engine.executeAction({ type: "START_LEVEL" });
    engine.executeAction({ type: "EXECUTE_COMMAND", command: "RIGHT" });
    const state = engine.getState();
    expect(state.grid!.position).toEqual({ x: 1, y: 0 });
    expect(state.commandHistory).toEqual(["RIGHT"]);
  });

  it("getState returns immutable snapshot", () => {
    const engine = new Engine();
    engine.loadLevel(level);
    const a = engine.getState();
    const b = engine.getState();
    expect(a).not.toBe(b);
    expect(a.grid).not.toBe(b.grid);
  });
});
