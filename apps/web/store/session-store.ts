"use client";

import { create } from "zustand";
import type { Engine } from "@cognitive/game-engine";
import type { LevelSchema } from "@cognitive/content-schema";

interface SessionState {
  engine: Engine | null;
  currentLevel: LevelSchema | null;
  setEngine: (engine: Engine | null) => void;
  setCurrentLevel: (level: LevelSchema | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  engine: null,
  currentLevel: null,
  setEngine: (engine) => set({ engine }),
  setCurrentLevel: (currentLevel) => set({ currentLevel }),
  reset: () => set({ engine: null, currentLevel: null }),
}));
