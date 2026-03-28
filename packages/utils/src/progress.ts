export interface Progress {
  completedLevels: Record<string, number>;
  xp?: number;
  lastLevelId?: string;
  lastWorldId?: string;
}

const STORAGE_KEY = "cognitive-progress";

const defaultProgress: Progress = {
  completedLevels: {},
  xp: 0,
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      completedLevels: parsed.completedLevels ?? {},
      xp: parsed.xp ?? 0,
      lastLevelId: parsed.lastLevelId,
      lastWorldId: parsed.lastWorldId,
    };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(data: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function recordCompletion(
  levelId: string,
  stars: number,
  xpDelta: number
): Progress {
  const current = loadProgress();
  const updated: Progress = {
    completedLevels: {
      ...current.completedLevels,
      [levelId]: Math.max(current.completedLevels[levelId] ?? 0, stars),
    },
    xp: (current.xp ?? 0) + xpDelta,
    lastLevelId: levelId,
  };
  saveProgress(updated);
  return updated;
}

export function setLastPosition(worldId: string, levelId: string): Progress {
  const current = loadProgress();
  const updated: Progress = {
    ...current,
    lastWorldId: worldId,
    lastLevelId: levelId,
  };
  saveProgress(updated);
  return updated;
}
