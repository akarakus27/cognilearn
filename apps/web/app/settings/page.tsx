import Link from "next/link";
import { ProgressCodeForm } from "@/components/settings/ProgressCodeForm";

export default function SettingsPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0f0a28 0%, #1a1040 40%, #0d1f3c 100%)",
      fontFamily: "Nunito, system-ui, sans-serif",
    }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 400, height: 400, top: -100, left: -100, borderRadius: "50%", background: "rgba(124,58,237,0.08)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 300, height: 300, bottom: -80, right: -80, borderRadius: "50%", background: "rgba(14,165,233,0.06)", filter: "blur(50px)" }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(15,10,40,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        height: 56, display: "flex", alignItems: "center",
        padding: "0 1.25rem", gap: "0.75rem",
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          color: "rgba(255,255,255,0.7)", textDecoration: "none",
          fontSize: 13, fontWeight: 700,
          padding: "0.35rem 0.65rem", borderRadius: "0.5rem",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
        }}>← Ana Sayfa</Link>
        <span style={{ flex: 1, color: "white", fontWeight: 800, fontSize: 15 }}>⚙️ Ayarlar</span>
        <Link href="/world/2" style={{
          color: "rgba(255,255,255,0.6)", textDecoration: "none",
          fontSize: 13, fontWeight: 700,
          padding: "0.35rem 0.65rem", borderRadius: "0.5rem",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
        }}>🧩 Oyna</Link>
      </nav>

      {/* Content */}
      <main id="main-content" style={{
        position: "relative", zIndex: 1,
        paddingTop: 80, paddingBottom: "3rem",
        paddingLeft: "clamp(1rem, 4vw, 2rem)",
        paddingRight: "clamp(1rem, 4vw, 2rem)",
        maxWidth: 600, margin: "0 auto",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 72, marginBottom: "0.75rem", lineHeight: 1 }}>⚙️</div>
          <h1 style={{
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            fontWeight: 900, color: "white",
            marginBottom: "0.5rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.4)",
          }}>Ayarlar</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            İlerleme yönetimi ve hesap araçları
          </p>
        </div>

        {/* Progress Tools Card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "1.5rem",
          padding: "1.75rem",
          marginBottom: "1.25rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            marginBottom: "1.25rem",
          }}>
            <span style={{ fontSize: 20 }}>💾</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>
              İlerleme Araçları
            </span>
          </div>
          <ProgressCodeForm />
        </div>

        {/* Coming Soon Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "1.5rem",
          padding: "1.5rem",
          marginBottom: "1.25rem",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            marginBottom: "1rem",
          }}>
            <span style={{ fontSize: 20 }}>🔮</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>
              Yakında Gelecek
            </span>
          </div>
          {[
            { icon: "🌙", label: "Koyu / Açık tema seçimi" },
            { icon: "🔔", label: "Günlük hatırlatıcılar" },
            { icon: "🌍", label: "Dil seçimi (TR / EN)" },
            { icon: "👤", label: "Profil & kullanıcı adı" },
            { icon: "📊", label: "Detaylı istatistikler" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)",
            }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
              {item.label}
              <span style={{
                marginLeft: "auto", fontSize: 11, fontWeight: 700,
                color: "#a78bfa", background: "rgba(167,139,250,0.15)",
                padding: "0.2rem 0.6rem", borderRadius: "1rem",
                border: "1px solid rgba(167,139,250,0.3)",
              }}>yakında</span>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem",
        }}>
          <Link href="/world/2" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "0.875rem",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white", borderRadius: "1rem", textDecoration: "none",
            fontWeight: 800, fontSize: 14,
            boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
          }}>
            🧩 Algorithm Builder
          </Link>
          <Link href="/" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            padding: "0.875rem",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.8)", borderRadius: "1rem", textDecoration: "none",
            fontWeight: 700, fontSize: 14,
          }}>
            🏠 Ana Sayfa
          </Link>
        </div>
      </main>
    </div>
  );
}
