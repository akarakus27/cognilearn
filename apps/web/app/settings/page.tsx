import Link from "next/link";

export default function SettingsPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc, #ede9fe)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Nunito, system-ui, sans-serif",
      padding: "1rem",
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: 420,
        width: "100%",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          border: "2px solid #f59e0b",
          borderRadius: "2rem",
          padding: "0.4rem 1.25rem",
          fontSize: 13,
          fontWeight: 800,
          color: "#92400e",
          marginBottom: "1.75rem",
        }}>
          🚧 Yapım Aşamasında
        </div>

        {/* Icon */}
        <div style={{ fontSize: 80, marginBottom: "1.25rem", lineHeight: 1 }}>⚙️</div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(1.5rem, 4vw, 2rem)",
          fontWeight: 900,
          color: "#1e293b",
          marginBottom: "0.75rem",
        }}>
          Ayarlar
        </h1>

        {/* Description */}
        <p style={{
          color: "#64748b",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: "0.5rem",
        }}>
          Bu bölüm üzerinde çalışıyoruz.
        </p>
        <p style={{
          color: "#94a3b8",
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}>
          Tema seçimi, ilerleme yönetimi ve daha fazlası çok yakında burada olacak! ✨
        </p>

        {/* Features coming */}
        <div style={{
          background: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "1.25rem",
          padding: "1.25rem",
          marginBottom: "2rem",
          textAlign: "left",
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", marginBottom: "0.875rem", letterSpacing: 1 }}>
            YAKINDA GELECEK
          </div>
          {[
            { icon: "🌙", label: "Koyu / Açık tema" },
            { icon: "📊", label: "İlerleme kodu dışa/içe aktar" },
            { icon: "🔔", label: "Günlük hatırlatıcılar" },
            { icon: "🌍", label: "Dil seçimi" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.5rem 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: 14,
              fontWeight: 600,
              color: "#475569",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
              <span style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 700,
                color: "#a78bfa",
                background: "#ede9fe",
                padding: "0.2rem 0.5rem",
                borderRadius: "1rem",
              }}>yakında</span>
            </div>
          ))}
        </div>

        {/* Back button */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white",
            padding: "0.875rem 2rem",
            borderRadius: "1rem",
            fontWeight: 800,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
          }}
        >
          🏠 Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
