"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchLevel, fetchWorld } from "@/lib/content-loader";
import type { LevelSchema } from "@cognitive/content-schema";
import { ChessLessonCanvas } from "@/components/chess/ChessLessonCanvas";
import { ChessMovesCanvas } from "@/components/chess/ChessMovesCanvas";

function slugToChessId(slug: string): string {
  // chess-l1p1 → chess/l1p1
  return slug.replace("-", "/");
}

function toSlug(id: string): string {
  return id.replace("/", "-");
}

export default function ChessPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const chessId = slugToChessId(id);

  const [level, setLevel] = useState<LevelSchema | null>(null);
  const [worldLevels, setWorldLevels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [data, world] = await Promise.all([
          fetchLevel(chessId),
          fetchWorld("3"),
        ]);
        setLevel(data);
        // Flatten all chapter levels into one list for next-navigation
        const all: string[] = [];
        if (world.chapters) {
          for (const ch of world.chapters) all.push(...ch.levels);
        }
        setWorldLevels(all);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    })();
  }, [chessId]);

  if (error) return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "Nunito, sans-serif" }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <p style={{ color: "#ef4444", fontWeight: 700 }}>{error}</p>
      <Link href="/world/3" style={{ color: "#7c3aed", fontWeight: 700 }}>← Back to Chess Kingdom</Link>
    </div>
  );

  if (!level) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>♟</div>
        <p style={{ color: "#94a3b8", fontWeight: 600 }}>Loading lesson…</p>
      </div>
    </div>
  );

  const idx = worldLevels.indexOf(chessId);
  const nextId = idx >= 0 && idx < worldLevels.length - 1 ? worldLevels[idx + 1] : null;
  const nextHref = nextId ? `/chess/${toSlug(nextId)}` : null;
  const worldHref = "/world/3";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #f5f3ff 100%)", fontFamily: "Nunito, sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.25rem 1rem 4rem" }}>
        {/* Back nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <Link href={worldHref} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "0.4rem 0.875rem", borderRadius: "0.75rem",
            background: "white", border: "1.5px solid #e2e8f0",
            fontSize: 13, fontWeight: 700, color: "#475569",
            textDecoration: "none",
          }}>
            ← Chess Kingdom
          </Link>
          {nextHref && (
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
              Next: {nextHref.split("/").pop()}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(1.1rem,3vw,1.4rem)", fontWeight: 900, color: "#1e293b", marginBottom: "1rem" }}>
          {level.learning_goal}
        </h1>

        {/* Canvas */}
        {level.mode === "chess-lesson" && (
          <ChessLessonCanvas level={level} nextHref={nextHref} worldHref={worldHref} />
        )}
        {level.mode === "chess-moves" && (
          <ChessMovesCanvas level={level} nextHref={nextHref} worldHref={worldHref} />
        )}
      </div>
    </div>
  );
}
