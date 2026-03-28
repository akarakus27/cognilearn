"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchWorld } from "@/lib/content-loader";
import type { WorldSchema } from "@cognitive/content-schema";
import { loadProgress } from "@cognitive/utils";
import { WorldMap } from "@/components/world/WorldMap";

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const WORLDS = [
  { id: "1", name: "First Steps",        icon: "🟢", color: "#059669" },
  { id: "2", name: "Algorithm Builder",  icon: "🧩", color: "#7c3aed" },
  { id: "3", name: "Chess Kingdom",      icon: "♟",  color: "#be185d" },
];

function toSlug(id: string) { return id.replace("/", "-"); }

function Sidebar({
  open, onClose, world, completed, currentId,
}: {
  open: boolean;
  onClose: () => void;
  world: WorldSchema;
  completed: Record<string, number>;
  currentId: string;
}) {
  const routePrefix = world.routePrefix ?? "level";

  // Flatten all levels (chapters or flat)
  const allLevels: Array<{ id: string; title: string; group: string }> = [];
  if (world.chapters) {
    for (const ch of world.chapters) {
      for (const lvl of ch.levels) {
        allLevels.push({ id: lvl, title: ch.levelTitles?.[lvl] ?? lvl, group: ch.title });
      }
    }
  } else {
    for (let i = 0; i < world.levels.length; i++) {
      const lvl = world.levels[i]!;
      allLevels.push({ id: lvl, title: world.levelTitles?.[lvl] ?? `Level ${i + 1}`, group: "" });
    }
  }

  const totalDone = allLevels.filter((l) => (completed[l.id] ?? 0) > 0).length;
  const pct = allLevels.length > 0 ? Math.round((totalDone / allLevels.length) * 100) : 0;

  // Group levels
  const groups: Record<string, typeof allLevels> = {};
  for (const l of allLevels) {
    const g = l.group || "Levels";
    if (!groups[g]) groups[g] = [];
    groups[g]!.push(l);
  }
  const groupNames = Object.keys(groups);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groupNames.map((g) => [g, true]))
  );

  const toggleGroup = (g: string) =>
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 320, maxWidth: "90vw",
        background: "white",
        zIndex: 50,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
        fontFamily: "Nunito, system-ui, sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding: "1.25rem 1rem 1rem",
          borderBottom: "1.5px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: "#0f172a" }}>{world.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              {totalDone} / {allLevels.length} completed
            </div>
            <div style={{
              marginTop: 6, height: 6, background: "#f1f5f9",
              borderRadius: "999px", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                borderRadius: "999px", transition: "width 0.6s",
              }} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "0.625rem",
              border: "1.5px solid #e2e8f0", background: "#f8fafc",
              cursor: "pointer", fontSize: 18, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#64748b", flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* World Switcher */}
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1.5px solid #f1f5f9" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Worlds
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {WORLDS.map((w) => (
              <Link
                key={w.id}
                href={`/world/${w.id}`}
                onClick={onClose}
                style={{
                  flex: 1, padding: "0.4rem 0.25rem",
                  background: w.id === currentId ? w.color : "#f8fafc",
                  color: w.id === currentId ? "white" : "#64748b",
                  border: `1.5px solid ${w.id === currentId ? w.color : "#e2e8f0"}`,
                  borderRadius: "0.625rem",
                  textDecoration: "none", textAlign: "center",
                  fontSize: 11, fontWeight: 800,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 16 }}>{w.icon}</div>
                <div style={{ marginTop: 1, lineHeight: 1.2 }}>{w.name.split(" ")[0]}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Level List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0" }}>
          {groupNames.map((groupName) => {
            const items = groups[groupName]!;
            const groupDone = items.filter((l) => (completed[l.id] ?? 0) > 0).length;
            const isOpen = openGroups[groupName] ?? true;

            return (
              <div key={groupName}>
                {/* Group header (only show if >1 group) */}
                {groupNames.length > 1 && (
                  <button
                    onClick={() => toggleGroup(groupName)}
                    style={{
                      width: "100%", padding: "0.5rem 1rem",
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#475569", flex: 1 }}>
                      {groupName}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
                      {groupDone}/{items.length}
                    </span>
                    <span style={{
                      fontSize: 12, color: "#94a3b8",
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}>▾</span>
                  </button>
                )}

                {/* Level items */}
                {isOpen && items.map((lvl, i) => {
                  const stars = completed[lvl.id] ?? 0;
                  const isDone = stars > 0;
                  // Unlock: first in group, or previous done
                  const prevId = i > 0 ? items[i - 1]!.id : null;
                  const unlocked = i === 0 || (prevId != null && (completed[prevId] ?? 0) > 0);
                  const isActive = unlocked && !isDone;

                  return (
                    <div key={lvl.id}>
                      {unlocked ? (
                        <Link
                          href={`/${routePrefix}/${toSlug(lvl.id)}`}
                          onClick={onClose}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.5rem 1rem",
                            textDecoration: "none",
                            background: isActive ? "#f5f3ff" : "transparent",
                            borderLeft: isActive ? "3px solid #7c3aed" : "3px solid transparent",
                            transition: "background 0.15s",
                          }}
                        >
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            background: isDone ? "#059669" : isActive ? "#7c3aed" : "#e2e8f0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 800, color: "white",
                          }}>
                            {isDone ? "✓" : i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: 700,
                              color: isDone ? "#059669" : isActive ? "#6d28d9" : "#374151",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {lvl.title}
                            </div>
                            {isDone && (
                              <div style={{ fontSize: 11, color: "#f59e0b" }}>
                                {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                              </div>
                            )}
                          </div>
                          {isActive && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: "#7c3aed",
                              background: "#ede9fe", padding: "2px 6px",
                              borderRadius: "999px", flexShrink: 0,
                            }}>Now</span>
                          )}
                        </Link>
                      ) : (
                        <div style={{
                          display: "flex", alignItems: "center", gap: "0.75rem",
                          padding: "0.5rem 1rem", opacity: 0.4,
                          borderLeft: "3px solid transparent",
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "#e2e8f0", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12,
                          }}>🔒</div>
                          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, flex: 1,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lvl.title}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "1rem", borderTop: "1.5px solid #f1f5f9",
          display: "flex", gap: "0.5rem",
        }}>
          <Link href="/" onClick={onClose} style={{
            flex: 1, padding: "0.6rem",
            background: "#f8fafc", border: "1.5px solid #e2e8f0",
            borderRadius: "0.75rem", textDecoration: "none",
            textAlign: "center", fontSize: 13, fontWeight: 700, color: "#475569",
          }}>
            🏠 Home
          </Link>
          <Link href="/settings" onClick={onClose} style={{
            flex: 1, padding: "0.6rem",
            background: "#f8fafc", border: "1.5px solid #e2e8f0",
            borderRadius: "0.75rem", textDecoration: "none",
            textAlign: "center", fontSize: 13, fontWeight: 700, color: "#475569",
          }}>
            📊 Progress
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorldPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [world, setWorld] = useState<WorldSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchWorld(id);
        setWorld(data);
        setCompleted(loadProgress().completedLevels);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
  }, [id]);

  if (!id) notFound();

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>😕</div>
        <p style={{ color: "#ef4444", fontWeight: 700 }}>Error: {error}</p>
        <Link href="/" style={{ color: "#6d28d9", fontWeight: 700, marginTop: 8, display: "block" }}>← Back Home</Link>
      </div>
    </div>
  );

  if (!world) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⏳</div>
        <p style={{ color: "#94a3b8", fontWeight: 600 }}>Loading world...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)", fontFamily: "Nunito, sans-serif" }}>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        world={world}
        completed={completed}
        currentId={id}
      />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.25rem 1rem 4rem" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "0.4rem 0.875rem", borderRadius: "0.75rem",
            background: "white", border: "1.5px solid #e2e8f0",
            fontSize: 13, fontWeight: 700, color: "#475569", textDecoration: "none",
          }}>
            ← Home
          </Link>

          {/* Menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              marginLeft: "auto",
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.4rem 0.875rem", borderRadius: "0.75rem",
              background: "white", border: "1.5px solid #e2e8f0",
              fontSize: 13, fontWeight: 700, color: "#475569",
              cursor: "pointer",
            }}
          >
            ☰ Menu
          </button>
        </div>

        <WorldMap world={world} completedLevels={completed} worldIdParam={id} />
      </div>
    </div>
  );
}
