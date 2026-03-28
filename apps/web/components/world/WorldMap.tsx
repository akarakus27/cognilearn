"use client";

import Link from "next/link";
import type { WorldSchema, ChapterSchema } from "@cognitive/content-schema";

export function isLevelUnlocked(
  levels: string[],
  index: number,
  completed: Record<string, number>
): boolean {
  if (index === 0) return true;
  const prev = levels[index - 1];
  return prev != null && (completed[prev] ?? 0) > 0;
}

function toSlug(levelId: string): string {
  return levelId.replace(/\//, "-");
}

function StarDisplay({ stars }: { stars: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ fontSize: 12, color: i <= stars ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </div>
  );
}

// ── Single level row ──────────────────────────────────────────────────────────
function LevelRow({
  levelId, index, totalInGroup, title, completedLevels,
  routePrefix, accentColor, accentLight, accentPill, accentPillText,
}: {
  levelId: string;
  index: number;
  totalInGroup: number;
  title: string;
  completedLevels: Record<string, number>;
  routePrefix: string;
  accentColor: string;
  accentLight: string;
  accentPill: string;
  accentPillText: string;
}) {
  const stars = completedLevels[levelId] ?? 0;
  const isDone = stars > 0;
  const unlocked = isLevelUnlocked(
    // build fake levels array just for this group
    Array.from({ length: totalInGroup }, (_, i2) => `__${i2}`).map((_, i2) =>
      i2 === index ? levelId : `__${i2}`
    ),
    index,
    // map back to real completed
    Object.fromEntries(
      Array.from({ length: totalInGroup }, (_, i2) => [`__${i2}`, i2 < index ? 1 : 0])
    )
  );

  // Simpler unlock: first always unlocked, rest need prev done
  // We pass pre-computed unlock from parent
  return null; // placeholder — see ChapterSection
}

// ── Chapter section ───────────────────────────────────────────────────────────
function ChapterSection({
  chapter,
  chapterIndex,
  allChapters,
  completedLevels,
  routePrefix,
  worldConfig,
}: {
  chapter: ChapterSchema;
  chapterIndex: number;
  allChapters: ChapterSchema[];
  completedLevels: Record<string, number>;
  routePrefix: string;
  worldConfig: ReturnType<typeof getWorldConfig>;
}) {
  const chapterDone = chapter.levels.every((id) => (completedLevels[id] ?? 0) > 0);
  const chapterCount = chapter.levels.filter((id) => (completedLevels[id] ?? 0) > 0).length;

  // Chapter is unlocked if it's the first, or if all levels in the previous chapter are done
  const prevChapter = chapterIndex > 0 ? allChapters[chapterIndex - 1] : null;
  const chapterUnlocked =
    chapterIndex === 0 ||
    (prevChapter != null && prevChapter.levels.every((id) => (completedLevels[id] ?? 0) > 0));

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* Chapter header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        padding: "0.75rem 1rem",
        background: chapterUnlocked
          ? `linear-gradient(135deg, ${worldConfig.headerFrom}, ${worldConfig.headerTo})`
          : "#f1f5f9",
        borderRadius: "1rem",
        marginBottom: "0.75rem",
        opacity: chapterUnlocked ? 1 : 0.5,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "0.75rem",
          background: chapterUnlocked ? "rgba(255,255,255,0.25)" : "#e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>
          {chapterUnlocked ? chapter.icon ?? "📖" : "🔒"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 900, fontSize: 15,
            color: chapterUnlocked ? "white" : "#94a3b8",
          }}>
            {chapter.title}
          </div>
          {chapter.description && (
            <div style={{ fontSize: 12, color: chapterUnlocked ? "rgba(255,255,255,0.8)" : "#cbd5e1" }}>
              {chapter.description}
            </div>
          )}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 800,
          color: chapterUnlocked ? "rgba(255,255,255,0.9)" : "#94a3b8",
          whiteSpace: "nowrap",
        }}>
          {chapterDone ? "✅" : `${chapterCount}/${chapter.levels.length}`}
        </div>
      </div>

      {/* Levels */}
      {chapterUnlocked && (
        <div style={{ paddingLeft: "0.75rem" }}>
          {chapter.levels.map((levelId, i) => {
            const stars = completedLevels[levelId] ?? 0;
            const isDone = stars > 0;
            const unlocked = i === 0 || (completedLevels[chapter.levels[i - 1]!] ?? 0) > 0;
            const isActive = unlocked && !isDone;
            const slug = toSlug(levelId);
            const title = chapter.levelTitles?.[levelId] ?? `Part ${i + 1}`;
            const href = `/${routePrefix}/${slug}`;

            let nodeColor = "#e5e7eb";
            let nodeBorder = "#d1d5db";
            let nodeText = "#9ca3af";
            let cardBg = "#f9fafb";
            let cardBorder = "#e5e7eb";

            if (isDone) {
              nodeColor = "#059669"; nodeBorder = "#10b981"; nodeText = "white";
              cardBg = "#f0fdf4"; cardBorder = "#bbf7d0";
            } else if (isActive) {
              nodeColor = worldConfig.activeNode; nodeBorder = worldConfig.activeNodeBorder; nodeText = "white";
              cardBg = worldConfig.activeBg; cardBorder = worldConfig.activeBorder;
            }

            const cardContent = (
              <div style={{
                display: "flex", alignItems: "center", gap: "0.875rem",
                padding: "0.75rem 0.875rem",
                background: cardBg, border: `2px solid ${cardBorder}`,
                borderRadius: "0.875rem",
                transition: "all 0.2s",
                cursor: unlocked ? "pointer" : "default",
                opacity: !unlocked ? 0.5 : 1,
                marginBottom: "0.4rem",
              }} className={unlocked ? "level-card" : ""}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: nodeColor, border: `3px solid ${nodeBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 13, color: nodeText, flexShrink: 0,
                  boxShadow: isActive ? `0 0 0 4px ${nodeBorder}40` : "none",
                }}>
                  {isDone ? "✓" : !unlocked ? "🔒" : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: unlocked ? "#1e293b" : "#94a3b8" }}>
                    {title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: 2 }}>
                    {isDone && <StarDisplay stars={stars} />}
                    {isActive && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        background: worldConfig.pillBg, color: worldConfig.pillText,
                        padding: "1px 7px", borderRadius: "999px",
                      }}>
                        ▶ Start
                      </span>
                    )}
                    {!unlocked && (
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Complete previous first</span>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {isDone && <span style={{ fontSize: 18 }}>✅</span>}
                  {isActive && <span style={{ fontSize: 18 }}>🌟</span>}
                  {!unlocked && <span style={{ fontSize: 16, opacity: 0.4 }}>🔒</span>}
                </div>
              </div>
            );

            return (
              <div key={levelId} style={{ position: "relative" }}>
                {i < chapter.levels.length - 1 && (
                  <div style={{
                    position: "absolute", left: 29, bottom: -6,
                    width: 2, height: 12,
                    background: isDone ? "#10b981" : "#e2e8f0", zIndex: 0,
                  }} />
                )}
                {unlocked
                  ? <Link href={href} style={{ textDecoration: "none", display: "block" }}>{cardContent}</Link>
                  : cardContent
                }
              </div>
            );
          })}
        </div>
      )}

      {!chapterUnlocked && (
        <div style={{
          padding: "0.75rem 1rem", textAlign: "center",
          color: "#94a3b8", fontSize: 13, fontWeight: 600,
        }}>
          🔒 Complete "{allChapters[chapterIndex - 1]?.title}" to unlock
        </div>
      )}
    </div>
  );
}

// ── World config ──────────────────────────────────────────────────────────────
function getWorldConfig(worldIdParam: string) {
  if (worldIdParam === "2") return {
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    accent: "#a78bfa", badge: "🧩", tag: "Algorithm Builder",
    headerFrom: "#7c3aed", headerTo: "#4f46e5",
    activeNode: "#7c3aed", activeNodeBorder: "#a78bfa",
    activeBg: "#f5f3ff", activeBorder: "#c4b5fd",
    pillBg: "#ede9fe", pillText: "#6d28d9",
  };
  if (worldIdParam === "3") return {
    gradient: "linear-gradient(135deg, #be185d 0%, #7c3aed 100%)",
    accent: "#f472b6", badge: "♟", tag: "Chess Kingdom",
    headerFrom: "#be185d", headerTo: "#7c3aed",
    activeNode: "#be185d", activeNodeBorder: "#f472b6",
    activeBg: "#fdf2f8", activeBorder: "#fbcfe8",
    pillBg: "#fce7f3", pillText: "#9d174d",
  };
  return {
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    accent: "#6ee7b7", badge: "🟢", tag: "First Steps",
    headerFrom: "#059669", headerTo: "#0d9488",
    activeNode: "#2563eb", activeNodeBorder: "#93c5fd",
    activeBg: "#eff6ff", activeBorder: "#bfdbfe",
    pillBg: "#dbeafe", pillText: "#1d4ed8",
  };
}

// ── Main WorldMap ─────────────────────────────────────────────────────────────
interface WorldMapProps {
  world: WorldSchema;
  completedLevels: Record<string, number>;
  worldIdParam: string;
}

export function WorldMap({ world, completedLevels, worldIdParam }: WorldMapProps) {
  const worldConfig = getWorldConfig(worldIdParam);
  const routePrefix = world.routePrefix ?? "level";

  // Chapter-based world (e.g. chess)
  if (world.chapters && world.chapters.length > 0) {
    const allLevels = world.chapters.flatMap((c) => c.levels);
    const totalLevels = allLevels.length;
    const completedCount = allLevels.filter((id) => (completedLevels[id] ?? 0) > 0).length;
    const progressPct = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

    return (
      <div style={{ fontFamily: "Nunito, system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{
          background: worldConfig.gradient, borderRadius: "1.5rem",
          padding: "1.5rem", marginBottom: "1.5rem", color: "white",
          position: "relative", overflow: "hidden",
        }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", width: 6, height: 6, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              left: `${(i * 19 + 5) % 100}%`, top: `${(i * 27 + 8) % 100}%`,
            }} />
          ))}
          <div style={{ position: "relative" }}>
            <span style={{
              display: "inline-block", background: "rgba(255,255,255,0.2)",
              borderRadius: "2rem", padding: "0.25rem 0.75rem",
              fontSize: 12, fontWeight: 700, marginBottom: "0.5rem",
            }}>
              {worldConfig.badge} {worldConfig.tag}
            </span>
            <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 900, margin: "0 0 0.25rem" }}>
              {world.name}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "0 0 1rem", fontSize: 14 }}>
              {world.description}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.25)", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${progressPct}%`,
                  background: worldConfig.accent, borderRadius: "9999px",
                  transition: "width 0.7s ease",
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
                {completedCount} / {totalLevels}
              </span>
            </div>
          </div>
        </div>

        {/* Chapters */}
        {world.chapters.map((chapter, i) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            chapterIndex={i}
            allChapters={world.chapters!}
            completedLevels={completedLevels}
            routePrefix={routePrefix}
            worldConfig={worldConfig}
          />
        ))}

        {completedCount === totalLevels && totalLevels > 0 && (
          <div style={{
            marginTop: "1rem", background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "white",
          }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🏆</div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>World Complete!</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              Amazing! You mastered all {totalLevels} lessons!
            </div>
          </div>
        )}

        <style>{`.level-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }`}</style>
      </div>
    );
  }

  // ── Flat level world (algorithm / first steps) ─────────────────────────────
  const totalLevels = world.levels.length;
  const completedCount = world.levels.filter((id) => (completedLevels[id] ?? 0) > 0).length;
  const progressPct = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

  return (
    <div style={{ fontFamily: "Nunito, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: worldConfig.gradient, borderRadius: "1.5rem",
        padding: "1.5rem", marginBottom: "1.5rem", color: "white",
        position: "relative", overflow: "hidden",
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", width: 6, height: 6, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            left: `${(i * 19 + 5) % 100}%`, top: `${(i * 27 + 8) % 100}%`,
          }} />
        ))}
        <div style={{ position: "relative" }}>
          <span style={{
            display: "inline-block", background: "rgba(255,255,255,0.2)",
            borderRadius: "2rem", padding: "0.25rem 0.75rem",
            fontSize: 12, fontWeight: 700, marginBottom: "0.5rem",
          }}>
            {worldConfig.badge} {worldConfig.tag}
          </span>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 900, margin: "0 0 0.25rem" }}>
            {world.name}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "0 0 1rem", fontSize: 14 }}>
            {world.description}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.25)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progressPct}%`,
                background: worldConfig.accent, borderRadius: "9999px", transition: "width 0.7s ease",
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
              {completedCount} / {totalLevels}
            </span>
          </div>
        </div>
      </div>

      {/* Levels */}
      <div style={{ position: "relative" }}>
        {world.levels.map((levelId, i) => {
          const stars = completedLevels[levelId] ?? 0;
          const unlocked = isLevelUnlocked(world.levels, i, completedLevels);
          const isDone = stars > 0;
          const isActive = unlocked && !isDone;
          const slug = toSlug(levelId);
          const title = world.levelTitles?.[levelId] ?? `Level ${i + 1}`;

          let nodeColor = "#e5e7eb", nodeBorder = "#d1d5db", nodeText = "#9ca3af";
          let cardBg = "#f9fafb", cardBorder = "#e5e7eb";
          if (isDone) {
            nodeColor = "#059669"; nodeBorder = "#10b981"; nodeText = "white";
            cardBg = "#f0fdf4"; cardBorder = "#bbf7d0";
          } else if (isActive) {
            nodeColor = worldConfig.activeNode; nodeBorder = worldConfig.activeNodeBorder; nodeText = "white";
            cardBg = worldConfig.activeBg; cardBorder = worldConfig.activeBorder;
          }

          const content = (
            <div style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "0.875rem 1rem",
              background: cardBg, border: `2px solid ${cardBorder}`,
              borderRadius: "1rem", transition: "all 0.2s",
              cursor: unlocked ? "pointer" : "default",
              opacity: !unlocked ? 0.55 : 1, marginBottom: "0.5rem",
            }} className={unlocked ? "level-card" : ""}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: nodeColor, border: `3px solid ${nodeBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 14, color: nodeText, flexShrink: 0,
                boxShadow: isActive ? `0 0 0 4px ${nodeBorder}40` : "none",
              }}>
                {isDone ? "✓" : !unlocked ? "🔒" : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: unlocked ? "#1e293b" : "#94a3b8", marginBottom: 2 }}>
                  {title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {isDone && <StarDisplay stars={stars} />}
                  {isActive && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      background: worldConfig.pillBg, color: worldConfig.pillText,
                      padding: "1px 8px", borderRadius: "999px",
                    }}>▶ Play now</span>
                  )}
                  {!unlocked && <span style={{ fontSize: 11, color: "#94a3b8" }}>Complete previous level</span>}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {isDone && <span style={{ fontSize: 20 }}>✅</span>}
                {isActive && <span style={{ fontSize: 20 }}>🌟</span>}
                {!unlocked && <span style={{ fontSize: 18, opacity: 0.4 }}>🔒</span>}
              </div>
            </div>
          );

          return (
            <div key={levelId} style={{ position: "relative" }}>
              {i < world.levels.length - 1 && (
                <div style={{
                  position: "absolute", left: 31, bottom: -8,
                  width: 2, height: 16,
                  background: isDone ? "#10b981" : "#e2e8f0", zIndex: 0,
                }} />
              )}
              {unlocked
                ? <Link href={`/level/${slug}`} style={{ textDecoration: "none", display: "block" }}>{content}</Link>
                : content
              }
            </div>
          );
        })}
      </div>

      {completedCount === totalLevels && totalLevels > 0 && (
        <div style={{
          marginTop: "1.5rem", background: "linear-gradient(135deg, #f59e0b, #ef4444)",
          borderRadius: "1rem", padding: "1.25rem", textAlign: "center", color: "white",
        }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🏆</div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>World Complete!</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            Amazing! You finished all {totalLevels} levels!
          </div>
        </div>
      )}

      <style>{`.level-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }`}</style>
    </div>
  );
}
