# CogniLearn

6–12 yaş arası çocuklar için tasarlanmış, oyunlaştırılmış bir bilişsel gelişim platformu. Algoritma düşüncesi, problem çözme ve satranç temellerini eğlenceli web tabanlı bulmacalar aracılığıyla öğretir.

---

## Özellikler

### 7 Öğrenme Dünyası

| Dünya | Konu | Seviye Sayısı |
|-------|------|---------------|
| 🗺️ Dünya 1 | Giriş & Oryantasyon | — |
| 🧩 Dünya 2 | Algoritma Temelleri (Sequence) | 21 seviye |
| ♟️ Dünya 3 | Satranç | — |
| 🔁 Dünya 4 | Loop Land — Döngüler | 12 seviye |
| 🤔 Dünya 5 | Akıllı Yollar — Koşullar (IF/ELSE) | 10 seviye |
| 🔧 Dünya 6 | Fonksiyon Fabrikası | 10 seviye |
| 🐛 Dünya 7 | Hata Avcısı — Debugging | 8 seviye |

### Oyun Motorları

- **Sequence** — Komut sırasına koy, robotu hedefe ulaştır
- **Loop** — REPEAT bloklarıyla tekrar eden hareketleri kısalt
- **Conditional** — IF/ELSE bloklarıyla koşullu kararlar al
- **Function** — Tekrar kullanılabilir fonksiyonlar yaz ve çağır
- **Debug** — Bozuk programdaki hatayı bul ve düzelt

### Platform Özellikleri

- ⭐ **3 yıldız sistemi** — Her seviyede optimal çözüme göre değerlendirme
- ⚡ **XP & streak takibi** — Günlük oynama serisi, kazanılan deneyim puanı
- 🔊 **Ses efektleri** — Web Audio API ile dosyasız, anlık geri bildirim
- 🎊 **Animasyonlu başarı ekranı** — Konfeti, yıldız animasyonları
- 💾 **İlerleme kodu** — Hesap gerektirmeden her cihazda devam
- 📱 **Mobil uyumlu** — 375px'den desktop'a responsive tasarım

---

## Kimler İçin?

| Kullanıcı | Nasıl Kullanır? |
|-----------|----------------|
| **Çocuklar (6–12 yaş)** | Bulmacaları çözer, seviyeleri geçer, ilerler |
| **Ebeveynler** | İlerleme kodunu kaydeder, farklı cihazda devam eder |
| **Öğretmenler** | Ders desteği olarak sınıfta kullanır |

---

## Neden CogniLearn?

- **Giriş yok, hesap yok** — Çocuk direkt başlar, sürtüşme sıfır
- **Offline çalışır** — İnternet olmadan da devam eder
- **İlerleme kaybolmaz** — Paylaşım kodu ile her cihazda devam edilebilir
- **Ekrana bağımlılık yaratmaz** — Kısa, odaklı seanslar için tasarlanmıştır

---

## Tech Stack

```
Next.js 14 · TypeScript · Tailwind CSS · Zustand
pnpm Workspaces · Web Audio API · LocalStorage
```

### Monorepo Yapısı

```
CogniLearn/
├── apps/
│   └── web/                  # Next.js frontend
├── packages/
│   ├── game-engine/          # Oyun motoru (test coverage: %95+)
│   ├── content-schema/       # Seviye JSON şemaları
│   └── utils/                # İlerleme, streak, ses yardımcıları
└── docs/                     # Genel dokümantasyon
```

---

## Geliştirme

```bash
# Bağımlılıkları kur
pnpm install

# Geliştirme sunucusu
pnpm dev

# Tüm testleri çalıştır
pnpm test:all

# Sadece web bileşen testleri
pnpm test:web

# E2E testleri (Playwright)
pnpm test:e2e
```

---

## Test

```
packages/game-engine/   → Jest · %95+ coverage
apps/web/               → Jest + React Testing Library + jest-axe
                           19 bileşen testi, WCAG 2.1 AA erişilebilirlik kontrolleri
e2e/                    → Playwright · mobil (375px, 390px) + desktop
```
