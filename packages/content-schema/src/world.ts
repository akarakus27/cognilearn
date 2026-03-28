export interface ChapterSchema {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  levels: string[];
  levelTitles?: Record<string, string>;
}

/** World metadata — progression, level list */
export interface WorldSchema {
  id: string;
  name: string;
  description?: string;
  /** Flat level list (algorithm/unplugged worlds) */
  levels: string[];
  /** Optional display names per level id */
  levelTitles?: Record<string, string>;
  /** Chapter-based structure (chess/advanced worlds) */
  chapters?: ChapterSchema[];
  /** URL prefix for level links: "level" | "chess" (default: "level") */
  routePrefix?: string;
  order: number;
}
