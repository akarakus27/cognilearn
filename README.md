# Cognitive Learning Platform

Lifelong cognitive development ecosystem — ages 6–12 MVP.

## Quick Start

```bash
pnpm install
pnpm dev
```

`predev` copies `content/` → `apps/web/public/content` (Vercel ve statik JSON için gerekli).

Tarayıcı: http://localhost:3000

## Routes

- `/` — Home
- `/world/1` — World map (levels, locks, stars)
- `/level/algorithm-level-001` — Play level (slug from `algorithm/level-001`)
- `/settings` — Export / import progress code

## Tests

```bash
pnpm test:all
pnpm ci
pnpm test:e2e
```

- **Unit:** `game-engine`, `utils`
- **E2E:** Playwright (`apps/web/e2e/smoke.spec.ts`) — önce `pnpm --filter web build` (CI’de otomatik)

## CI (GitHub Actions)

`pnpm install` → unit testler → `web` build → Playwright (Chromium) smoke.

## Vercel

1. Projeyi Git’e bağla; **Root Directory:** `apps/web`
2. `apps/web/vercel.json` monorepo kökünden `pnpm install` ve `pnpm --filter web build` çalıştırır
3. İçerik `prebuild` ile `public/content` altına kopyalanır; ekstra ayar gerekmez

## Lockfile

```bash
pnpm install
```

Kökte `pnpm-lock.yaml` oluşur; CI’de deterministik kurulum için commit etmen önerilir (`pnpm install --frozen-lockfile`).

## Packages

- `packages/game-engine` — Grid, Command, Validator, State Machine, Reward
- `packages/content-schema` — Level & World types
- `packages/utils` — Progress (LocalStorage), Progress Code
