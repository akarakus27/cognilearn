export interface Progress {
  completedLevels: Record<string, number>;
  xp?: number;
  lastLevelId?: string;
  lastWorldId?: string;
  streakDays?: number;
  lastPlayedDate?: string; // "YYYY-MM-DD"
}

const STORAGE_KEY = "cognitive-progress";

const defaultProgress: Progress = {
  completedLevels: {},
  xp: 0,
  streakDays: 0,
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
      streakDays: parsed.streakDays ?? 0,
      lastPlayedDate: parsed.lastPlayedDate,
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

/** Returns today's date string "YYYY-MM-DD" */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns yesterday's date string "YYYY-MM-DD" */
function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Update streak on play. Call once per session/day. */
function updateStreak(current: Progress): Progress {
  const today = todayStr();
  const last = current.lastPlayedDate;

  if (last === today) {
    // Already played today — no change
    return current;
  }

  const newStreak = last === yesterdayStr()
    ? (current.streakDays ?? 0) + 1  // consecutive day
    : 1;                              // streak broken or first time

  return { ...current, streakDays: newStreak, lastPlayedDate: today };
}

export function recordCompletion(
  levelId: string,
  stars: number,
  xpDelta: number
): Progress {
  const current = loadProgress();
  const withStreak = updateStreak(current);
  const updated: Progress = {
    ...withStreak,
    completedLevels: {
      ...withStreak.completedLevels,
      [levelId]: Math.max(withStreak.completedLevels[levelId] ?? 0, stars),
    },
    xp: (withStreak.xp ?? 0) + xpDelta,
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

/** Returns current streak days (0 if never played or streak broken) */
export function getStreak(): number {
  const p = loadProgress();
  const last = p.lastPlayedDate;
  if (!last) return 0;
  const today = todayStr();
  const yesterday = yesterdayStr();
  if (last === today || last === yesterday) return p.streakDays ?? 0;
  return 0; // streak broken
}
