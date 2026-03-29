"use client";

import { useState } from "react";
import {
  encodeProgress,
  decodeProgress,
  loadProgress,
  saveProgress,
  type Progress,
} from "@cognitive/utils";

export function ProgressCodeForm() {
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    const p = loadProgress();
    const code = encodeProgress(p);
    void navigator.clipboard.writeText(code).then(() => {
      setMessage("Copied to clipboard.");
    });
  };

  const handleImport = () => {
    setMessage(null);
    try {
      const decoded = decodeProgress(importText.trim());
      const merged: Progress = {
        completedLevels: {
          ...loadProgress().completedLevels,
          ...decoded.completedLevels,
        },
        xp: Math.max(loadProgress().xp ?? 0, decoded.xp ?? 0),
        lastLevelId: decoded.lastLevelId ?? loadProgress().lastLevelId,
        lastWorldId: decoded.lastWorldId ?? loadProgress().lastWorldId,
      };
      saveProgress(merged);
      setMessage("Progress imported.");
      setImportText("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Import failed");
    }
  };

  return (
    <section
      aria-labelledby="progress-code-title"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div>
        <h2 id="progress-code-title" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Export</h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: "0.5rem" }}>
          Copy your progress code to back up or move to another device.
        </p>
        <button
          type="button"
          onClick={handleExport}
          aria-label="Copy progress code to clipboard"
          style={{
            padding: "0.5rem 1rem",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: 600,
            minHeight: 44,
          }}
        >
          Copy progress code
        </button>
      </div>
      <div>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Import</h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: "0.5rem" }}>
          Paste a code here. Progress is merged with what you already have.
        </p>
        <label
          htmlFor="progress-import-code"
          style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: "0.35rem" }}
        >
          Progress code
        </label>
        <textarea
          id="progress-import-code"
          aria-describedby="progress-import-help"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            maxWidth: "100%",
            padding: "0.5rem",
            fontFamily: "monospace",
            fontSize: 13,
            borderRadius: "0.375rem",
            border: "1px solid #d1d5db",
          }}
          placeholder="Paste progress code…"
        />
        <p id="progress-import-help" style={{ color: "#64748b", fontSize: 12, marginTop: "0.35rem" }}>
          Paste an exported backup code from another device.
        </p>
        <button
          type="button"
          onClick={handleImport}
          aria-label="Import progress code"
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontWeight: 600,
            minHeight: 44,
          }}
        >
          Import
        </button>
      </div>
      {message && (
        <p
          role={message.toLowerCase().includes("fail") || message.toLowerCase().includes("invalid") ? "alert" : "status"}
          aria-live="polite"
          style={{ color: "#15803d", fontSize: 14 }}
        >
          {message}
        </p>
      )}
    </section>
  );
}

export default ProgressCodeForm;
