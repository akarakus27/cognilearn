"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Engine, computeReward } from "@cognitive/game-engine";
import type { LevelSchema } from "@cognitive/content-schema";
import type { Action } from "@cognitive/game-engine";
import { LevelCanvas } from "./LevelCanvas";
import { fetchLevel, fetchWorld } from "@/lib/content-loader";
import { useSessionStore } from "@/store/session-store";
import { recordCompletion } from "@cognitive/utils";
import Link from "next/link";

interface LevelPageClientProps {
  levelId: string;
  worldId: string;
}

function slugToLevelId(slug: string): string {
  return slug.replace(/^algorithm-/, "algorithm/");
}

function toSlug(levelId: string): string {
  return levelId.replace(/\//, "-");
}

export function LevelPageClient({ levelId, worldId }: LevelPageClientProps) {
  const [level, setLevel] = useState<LevelSchema | null>(null);
  const [worldLevels, setWorldLevels] = useState<string[]>([]);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [state, setState] = useState<ReturnType<Engine["getState"]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recordedKey = useRef<string | null>(null);

  const { setEngine: setStoreEngine, setCurrentLevel } = useSessionStore();
  const contentLevelId = slugToLevelId(levelId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [data, world] = await Promise.all([
          fetchLevel(contentLevelId),
          fetchWorld(worldId),
        ]);
        if (cancelled) return;
        setLevel(data);
        setWorldLevels(world.levels);
        const e = new Engine();
        e.loadLevel(data);
        setEngine(e);
        setState(e.getState());
        recordedKey.current = null;
        setStoreEngine(e);
        setCurrentLevel(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contentLevelId, worldId, setStoreEngine, setCurrentLevel]);

  const nextLevelHref = useMemo(() => {
    const idx = worldLevels.indexOf(contentLevelId);
    if (idx < 0 || idx >= worldLevels.length - 1) return null;
    return `/level/${toSlug(worldLevels[idx + 1]!)}`;
  }, [worldLevels, contentLevelId]);

  useEffect(() => {
    if (!level || !state || state.phase !== "success") return;
    const key = `${level.id}-${state.commandHistory.join(",")}`;
    if (recordedKey.current === key) return;
    recordedKey.current = key;
    const r = computeReward(level, state.commandHistory);
    recordCompletion(level.id, r.stars, r.xp);
  }, [level, state]);

  const handleAction = useCallback(
    (action: Action) => {
      if (!engine) return;
      const next = engine.executeAction(action);
      setState(next);
    },
    [engine]
  );

  useEffect(() => {
    if (state?.level?.mode === "sequence") return;
    const keyMap: Record<string, Action> = {
      ArrowUp:    { type: "EXECUTE_COMMAND", command: "UP" },
      ArrowDown:  { type: "EXECUTE_COMMAND", command: "DOWN" },
      ArrowLeft:  { type: "EXECUTE_COMMAND", command: "LEFT" },
      ArrowRight: { type: "EXECUTE_COMMAND", command: "RIGHT" },
      w: { type: "EXECUTE_COMMAND", command: "UP" },
      s: { type: "EXECUTE_COMMAND", command: "DOWN" },
      a: { type: "EXECUTE_COMMAND", command: "LEFT" },
      d: { type: "EXECUTE_COMMAND", command: "RIGHT" },
      r: { type: "RESET_PLAY" },
    };
    const onKey = (e: KeyboardEvent) => {
      const action = keyMap[e.key];
      if (!action) return;
      e.preventDefault();
      handleAction(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAction]);

  if (error) return <p>Hata: {error}</p>;
  if (!level || !state) return <p>Yükleniyor...</p>;

  return (
    <main className="app-shell" style={{ padding: "clamp(1rem, 3vw, 1.5rem)", maxWidth: 640, margin: "0 auto" }}>
      <Link href={`/world/${worldId}`} style={{ fontSize: 14, color: "#666", marginBottom: "1rem", display: "block" }}>
        ← Dünya {worldId}&apos;e Dön
      </Link>
      <h1 style={{ fontSize: "clamp(1.15rem, 3.5vw, 1.5rem)" }}>{level.learning_goal}</h1>
      <LevelCanvas
        state={state}
        onAction={handleAction}
        worldId={worldId}
        levelId={contentLevelId}
        nextLevelHref={nextLevelHref}
      />
    </main>
  );
}
