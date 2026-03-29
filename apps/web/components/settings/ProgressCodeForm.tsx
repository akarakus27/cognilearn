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
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleExport = () => {
    const p = loadProgress();
    const code = encodeProgress(p);
    void navigator.clipboard.writeText(code).then(() => {
      setMessage({ text: "✓ Panoya kopyalandı!", ok: true });
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleImport = () => {
    setMessage(null);
    try {
      const decoded = decodeProgress(importText.trim());
      const current = loadProgress();
      const merged: Progress = {
        completedLevels: { ...current.completedLevels, ...decoded.completedLevels },
        xp: Math.max(current.xp ?? 0, decoded.xp ?? 0),
        lastLevelId: decoded.lastLevelId ?? current.lastLevelId,
        lastWorldId: decoded.lastWorldId ?? current.lastWorldId,
      };
      saveProgress(merged);
      setMessage({ text: "✓ İlerleme başarıyla aktarıldı!", ok: true });
      setImportText("");
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : "Geçersiz kod", ok: false });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "0.65rem 0.875rem",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: "0.75rem",
    color: "white",
    fontFamily: "monospace", fontSize: 13,
    outline: "none",
    resize: "vertical",
  };

  return (
    <section aria-labelledby="progress-code-title" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Export */}
      <div>
        <h2 id="progress-code-title" style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: "0.35rem" }}>
          📤 Dışa Aktar
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: "0.875rem", lineHeight: 1.6 }}>
          İlerleme kodunu kopyala — başka cihazda devam etmek için kullan.
        </p>
        <button
          type="button"
          onClick={handleExport}
          aria-label="Copy progress code to clipboard"
          style={{
            padding: "0.7rem 1.5rem",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white", border: "none", borderRadius: "0.875rem",
            cursor: "pointer", fontWeight: 800, fontSize: 14,
            minHeight: 44, boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
            width: "100%",
          }}
        >
          📋 İlerleme Kodunu Kopyala
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Import */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: "0.35rem" }}>
          📥 İçe Aktar
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: "0.875rem", lineHeight: 1.6 }}>
          Başka cihazdan kodu yapıştır — ilerleme mevcut veriyle birleştirilir.
        </p>
        <label
          htmlFor="progress-import-code"
          style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: "0.4rem", letterSpacing: 0.5 }}
        >
          İLERLEME KODU
        </label>
        <textarea
          id="progress-import-code"
          aria-label="Progress code"
          aria-describedby="progress-import-help"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={3}
          style={inputStyle}
          placeholder="Kodu buraya yapıştır..."
        />
        <p id="progress-import-help" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: "0.35rem", marginBottom: "0.875rem" }}>
          Başka bir cihazdan dışa aktarılan kodu yapıştır.
        </p>
        <button
          type="button"
          onClick={handleImport}
          disabled={!importText.trim()}
          aria-label="Import progress code"
          style={{
            padding: "0.7rem 1.5rem",
            background: importText.trim()
              ? "linear-gradient(135deg, #059669, #047857)"
              : "rgba(255,255,255,0.07)",
            color: importText.trim() ? "white" : "rgba(255,255,255,0.3)",
            border: "none", borderRadius: "0.875rem",
            cursor: importText.trim() ? "pointer" : "not-allowed",
            fontWeight: 800, fontSize: 14, minHeight: 44,
            width: "100%",
            transition: "all 0.2s",
          }}
        >
          ✓ Aktarımı Uygula
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          role={message.ok ? "status" : "alert"}
          aria-live="polite"
          style={{
            padding: "0.75rem 1rem",
            background: message.ok ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${message.ok ? "rgba(5,150,105,0.4)" : "rgba(239,68,68,0.4)"}`,
            borderRadius: "0.75rem",
            color: message.ok ? "#6ee7b7" : "#fca5a5",
            fontSize: 13, fontWeight: 700, textAlign: "center",
          }}
        >
          {message.text}
        </div>
      )}
    </section>
  );
}

export default ProgressCodeForm;
