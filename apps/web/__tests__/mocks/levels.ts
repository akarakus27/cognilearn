import type { EngineState } from "@cognitive/game-engine";
import type { LevelSchema, WorldSchema } from "@cognitive/content-schema";

export const mockLevel: LevelSchema = {
  id: "level-1",
  skill_target: "sequence",
  difficulty: 1,
  learning_goal: "Reach the goal",
  expected_behavior: "Move the player to the goal.",
  mode: "step",
  grid: {
    rows: 3,
    cols: 3,
    start: { x: 0, y: 0 },
    goal: { x: 2, y: 1 },
    obstacles: [{ x: 1, y: 1 }],
  },
};

export const mockState: EngineState = {
  level: mockLevel,
  phase: "play",
  commandHistory: [],
  grid: {
    rows: 3,
    cols: 3,
    position: { x: 0, y: 0 },
    goal: { x: 2, y: 1 },
    obstacles: [{ x: 1, y: 1 }],
  },
};

export const introState: EngineState = {
  ...mockState,
  phase: "intro",
};

export const mockWorld: WorldSchema = {
  id: "world-1",
  name: "First Steps",
  description: "Learn to move one step at a time",
  levels: ["level-1", "level-2", "level-3"],
  levelTitles: {
    "level-1": "Level 1",
    "level-2": "Level 2",
    "level-3": "Level 3",
  },
  order: 1,
};
