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

// ─── Top Navbar ───────────────────────────────────────────────────────────────
function LevelNav({ worldId, levelTitle }: { worldId: string; levelTitle: string }) {
  return (
    <nav style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 50,
      background: "rgba(15,10,40,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      height: 56,
      display: "flex",
      alignItems: "center",
      padding: "0 1rem",
      gap: "0.75rem",
    }}>
      {/* Back */}
      <Link href={`/world/${worldId}`} style={{
        display: "flex", alignItems: "center", gap: "0.35rem",
        color: "rgba(255,255,255,0.7)", textDecoration: "none",
        fontSize: 13, fontWeight: 700,
        padding: "0.35rem 0.65rem",
        borderRadius: "0.5rem",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        whiteSpace: "nowrap",
      }}>
        ← Dünya
      </Link>

      {/* Level title */}
      <span style={{
        flex: 1, color: "white", fontWeight: 800,
        fontSize: "clamp(12px, 3vw, 15px)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontFamily: "Nunito, sans-serif",
      }}>
        {levelTitle}
      </span>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <Link href="/world/1" style={navLinkStyle}>🗺️</Link>
        <Link href="/world/2" style={navLinkStyle}>🧩</Link>
        <Link href="/world/3" style={navLinkStyle}>♟️</Link>
        <Link href="/world/4" style={navLinkStyle}>🔁</Link>
        <Link href="/world/5" style={navLinkStyle}>🤔</Link>
        <Link href="/world/6" style={navLinkStyle}>🔧</Link>
        <Link href="/world/7" style={navLinkStyle}>🐛</Link>
        <Link href="/" style={{ ...navLinkStyle, marginLeft: "0.25rem", background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.4)" }}>🏠</Link>
      </div>
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 32, height: 32, borderRadius: "0.5rem",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  textDecoration: "none", fontSize: 16,
  color: "white",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function LevelPageClient({ levelId, worldId: worldIdProp }: LevelPageClientProps) {
  const [level, setLevel] = useState<LevelSchema | null>(null);
  const [worldLevels, setWorldLevels] = useState<string[]>([]);
  const [resolvedWorldId, setResolvedWorldId] = useState<string>(worldIdProp);
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
        // Try all worlds to find which one contains this level
        const ALL_WORLD_IDS = ["1", "2", "3", "4", "5", "6", "7"];
        const [data, ...worlds] = await Promise.all([
          fetchLevel(contentLevelId),
          ...ALL_WORLD_IDS.map((wid) => fetchWorld(wid).catch(() => null)),
        ]);
        if (cancelled) return;

        // Find which world contains the level
        let foundWorldId = worldIdProp;
        let foundLevels: string[] = [];
        for (let i = 0; i < ALL_WORLD_IDS.length; i++) {
          const w = worlds[i];
          if (w && w.levels.includes(contentLevelId)) {
            foundWorldId = ALL_WORLD_IDS[i]!;
            foundLevels = w.levels;
            break;
          }
        }

        setLevel(data);
        setWorldLevels(foundLevels);
        setResolvedWorldId(foundWorldId);
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
    return () => { cancelled = true; };
  }, [contentLevelId, worldIdProp, setStoreEngine, setCurrentLevel]);

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

  // Retry from success screen
  const handleRetry = useCallback(() => {
    if (!engine) return;
    const next = engine.executeAction({ type: "RETRY" });
    // RETRY only works from fail — reload level from intro
    if (level) {
      const e = new Engine();
      e.loadLevel(level);
      e.executeAction({ type: "START_LEVEL" });
      setEngine(e);
      setState(e.getState());
      recordedKey.current = null;
    } else {
      setState(next);
    }
  }, [engine, level]);

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
  }, [handleAction, state?.level?.mode]);

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0a28", color: "white", fontFamily: "Nunito, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ fontSize: 16, color: "#fca5a5" }}>Hata: {error}</p>
        <Link href="/" style={{ color: "#a78bfa", marginTop: 16, display: "block" }}>← Ana Sayfa</Link>
      </div>
    </div>
  );

  if (!level || !state) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0a28" }}>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: "spin 1s linear infinite" }}>⚙️</div>
        <p style={{ fontWeight: 700 }}>Yükleniyor...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Success screen is full-page — don't wrap with nav/bg
  if (state.phase === "success") {
    return (
      <LevelCanvas
        state={state}
        onAction={handleAction}
        worldId={resolvedWorldId}
        levelId={contentLevelId}
        nextLevelHref={nextLevelHref}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0f0a28 0%, #1a1040 40%, #0d1f3c 100%)",
      position: "relative",
    }}>
      {/* Background decorations */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 400, height: 400, top: -100, left: -100, borderRadius: "50%", background: "rgba(124,58,237,0.08)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 300, height: 300, bottom: -80, right: -80, borderRadius: "50%", background: "rgba(14,165,233,0.06)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", width: 200, height: 200, top: "40%", right: "15%", borderRadius: "50%", background: "rgba(245,158,11,0.04)", filter: "blur(40px)" }} />
      </div>

      {/* Navbar */}
      <LevelNav worldId={resolvedWorldId} levelTitle={level.learning_goal} />

      {/* Content */}
      <main style={{
        position: "relative", zIndex: 1,
        paddingTop: 72,
        paddingBottom: "2rem",
        paddingLeft: "clamp(0.75rem, 3vw, 1.5rem)",
        paddingRight: "clamp(0.75rem, 3vw, 1.5rem)",
        maxWidth: 640,
        margin: "0 auto",
      }}>
        {/* Level card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1.5rem",
          padding: "1.5rem 1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}>
          <LevelCanvas
            state={state}
            onAction={handleAction}
            worldId={resolvedWorldId}
            levelId={contentLevelId}
            nextLevelHref={nextLevelHref}
            onRetry={handleRetry}
          />
        </div>
      </main>
    </div>
  );
}
