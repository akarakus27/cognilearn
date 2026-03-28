import type { LevelSchema } from "@cognitive/content-schema";
import type { WorldSchema } from "@cognitive/content-schema";

/** Static JSON under /content (see scripts/copy-content.mjs) */
const BASE = "/content";

export async function fetchWorld(worldId: string): Promise<WorldSchema> {
  const path = worldId.startsWith("world-") ? worldId : `world-${worldId}`;
  const res = await fetch(`${BASE}/worlds/${path}.json`);
  if (!res.ok) throw new Error(`World ${worldId} not found`);
  return res.json();
}

export async function fetchLevel(levelId: string): Promise<LevelSchema> {
  const res = await fetch(`${BASE}/${levelId}.json`);
  if (!res.ok) throw new Error(`Level ${levelId} not found`);
  return res.json();
}
