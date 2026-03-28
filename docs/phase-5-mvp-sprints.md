# PHASE 5 — MVP SPRINT SYSTEM

## Cognitive Learning Platform — 4 Structured Sprints

---

## Sprint Overview

| Sprint | Theme | Outcome |
|--------|-------|---------|
| **Sprint 1** | Foundation & Shell | Mono-repo running; Welcome + routing |
| **Sprint 2** | Game Engine Core | Engine packages; Grid, Validator, State Machine |
| **Sprint 3** | Content & Integration | World 1 content; Progress; Level load flow |
| **Sprint 4** | Playable Loop & Polish | Full play cycle; Rewards; Progress Code |

---

# SPRINT 1 — Foundation & Shell

**Goal:** Mono-repo scaffold, content schema, Next.js shell, Welcome page, routing.

## Tasks

| ID | Task | Priority |
|----|------|----------|
| 1.1 | Initialize pnpm workspace; create root `package.json`, `pnpm-workspace.yaml` | P0 |
| 1.2 | Create `packages/content-schema` with Level and World types | P0 |
| 1.3 | Create `packages/utils` (empty scaffold, tsconfig) | P0 |
| 1.4 | Create `apps/web` (Next.js 14+, App Router) | P0 |
| 1.5 | Add Welcome page at `/` with "Start Learning" CTA | P0 |
| 1.6 | Add placeholder routes: `/world/[id]`, `/level/[id]` | P0 |
| 1.7 | Wire `apps/web` to `@cognitive/content-schema`, `@cognitive/utils` | P0 |

## Acceptance Criteria

| Criterion | Verification |
|-----------|--------------|
| `pnpm install` succeeds at root | Run from root; no errors |
| `pnpm dev` starts Next.js on `/` | Browser shows Welcome page |
| `/world/1` and `/level/1` render (placeholder) | Navigate; no 404 |
| `content-schema` exports `LevelSchema`, `WorldSchema` types | Import in app; no type error |
| No game logic in `apps/web` | Grep for engine imports; none |

## Files Affected

```
cognitive-platform/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json (root)
├── apps/web/
│   ├── package.json
│   ├── next.config.js
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── world/[id]/page.tsx
│   │   └── level/[id]/page.tsx
│   └── tsconfig.json
└── packages/
    ├── content-schema/
    │   ├── package.json
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── level.ts
    │   │   └── world.ts
    │   └── tsconfig.json
    └── utils/
        ├── package.json
        ├── src/
        │   └── index.ts
        └── tsconfig.json
```

## Testing Approach

| Type | Approach |
|------|----------|
| Unit | N/A (no logic yet) |
| Integration | Manual: `pnpm install`, `pnpm dev`, click through routes |
| E2E | N/A for Sprint 1 |

---

# SPRINT 2 — Game Engine Core

**Goal:** Game engine package with Grid, Command Execution, Validator, Level State Machine. Framework-agnostic; no UI.

## Tasks

| ID | Task | Priority |
|----|------|----------|
| 2.1 | Create `packages/game-engine`; tsconfig; no React/DOM imports | P0 |
| 2.2 | Implement Grid Engine: create grid, get/set cell, validate bounds | P0 |
| 2.3 | Implement Command Execution Engine: run sequence, step-by-step | P0 |
| 2.4 | Implement Puzzle Validator: compare user solution vs expected | P0 |
| 2.5 | Implement Level State Machine: intro → play → result | P0 |
| 2.6 | Expose `loadLevel()`, `executeAction()`, `getState()` | P0 |
| 2.7 | Add unit tests for Grid, Validator, State Machine | P0 |

## Acceptance Criteria

| Criterion | Verification |
|-----------|--------------|
| `game-engine` has zero UI/framework imports | Grep for react, next, dom; none |
| `loadLevel(levelId)` returns initial state | Unit test |
| `executeAction(action)` updates state | Unit test |
| `getState()` returns current engine state | Unit test |
| Validator returns `{ valid: boolean, feedback?: string }` | Unit test |
| State machine: intro → play → result transitions | Unit test |
| All engine tests pass | `pnpm test` in `packages/game-engine` |

## Files Affected

```
packages/game-engine/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── grid.ts
│   ├── command.ts
│   ├── validator.ts
│   ├── state-machine.ts
│   └── types.ts
└── __tests__/
    ├── grid.test.ts
    ├── validator.test.ts
    └── state-machine.test.ts
```

## Testing Approach

| Type | Approach |
|------|----------|
| Unit | Vitest or Jest; test each engine in isolation |
| Integration | Test `loadLevel` → `executeAction` → `getState` flow |
| E2E | N/A for Sprint 2 |

---

# SPRINT 3 — Content & Integration

**Goal:** World 1 content, progress in LocalStorage, level load flow, frontend wired to engine.

## Tasks

| ID | Task | Priority |
|----|------|----------|
| 3.1 | Create `content/worlds/world-1.json` with metadata, level list | P0 |
| 3.2 | Create `content/algorithm/level-001.json` … `level-005.json` (World 1, first 5 levels) | P0 |
| 3.3 | Implement `utils` Progress store: load/save to LocalStorage | P0 |
| 3.4 | Implement content loader in `apps/web` (fetch JSON) | P0 |
| 3.5 | Wire `/level/[id]` to load level JSON → engine.loadLevel() | P0 |
| 3.6 | Add minimal game canvas component (displays engine state) | P0 |
| 3.7 | Add Zustand or Context for session state (current level, engine ref) | P0 |

## Acceptance Criteria

| Criterion | Verification |
|-----------|--------------|
| World 1 JSON loads; 5 levels listed | Manual: fetch `/content/worlds/world-1.json` |
| Level 1 JSON conforms to LevelSchema | Schema validation (or type check) |
| LocalStorage stores progress (level completed, stars) | DevTools → Application → LocalStorage |
| `/level/1` loads level, passes to engine, canvas shows state | Manual |
| No engine logic in React components | Components only display state, forward input |
| Resume: last level persists across refresh | Complete level 1, refresh, verify state |

## Files Affected

```
content/
├── worlds/
│   └── world-1.json
└── algorithm/
    ├── level-001.json
    ├── level-002.json
    ├── level-003.json
    ├── level-004.json
    └── level-005.json

packages/utils/
└── src/
    ├── index.ts
    └── progress.ts

apps/web/
├── app/
│   ├── level/[id]/page.tsx
│   └── world/[id]/page.tsx
├── components/
│   └── game/
│       └── LevelCanvas.tsx
├── lib/
│   ├── content-loader.ts
│   └── progress-store.ts
└── store/
    └── session-store.ts (or Zustand)
```

## Testing Approach

| Type | Approach |
|------|----------|
| Unit | Progress encode/decode; content loader (mock JSON) |
| Integration | Load level → engine → canvas; verify state flow |
| Manual | Full path: Home → World 1 → Level 1 → see puzzle |
| E2E | Optional: Playwright for happy path |

---

# SPRINT 4 — Playable Loop & Polish

**Goal:** Full play cycle, success/fail feedback, rewards, Progress Code, world map, responsive polish.

## Tasks

| ID | Task | Priority |
|----|------|----------|
| 4.1 | Implement Reward Engine: compute stars, XP, unlock next | P0 |
| 4.2 | On level success: validate → reward → save progress → show feedback | P0 |
| 4.3 | On level fail: show feedback; allow retry (no penalty) | P0 |
| 4.4 | Implement Progress Code: encode progress to shareable string | P0 |
| 4.5 | Implement Progress Code import: decode, validate, load | P0 |
| 4.6 | Add Settings/Export and Settings/Import UI | P0 |
| 4.7 | Add World Map view: show worlds, levels, unlock state | P0 |
| 4.8 | Add success animation, star display, "Next Level" button | P0 |
| 4.9 | Responsive polish: tablet-friendly layout | P1 |

## Acceptance Criteria

| Criterion | Verification |
|-----------|--------------|
| Complete level → stars shown → next level unlocked | Manual playthrough |
| Fail level → feedback shown → retry works | Manual |
| Export Progress Code → copy → clear LocalStorage → Import → progress restored | Manual |
| World Map shows World 1; levels 1–5; lock state correct | Manual |
| Stars (1–3) computed by Reward Engine | Unit test |
| Progress Code round-trip: encode → decode → same data | Unit test |
| Layout works on 768px width | Manual resize |
| No console errors during play | DevTools console |

## Files Affected

```
packages/game-engine/
└── src/
    └── reward.ts

packages/utils/
└── src/
    └── progress-codec.ts

apps/web/
├── app/
│   ├── page.tsx (Welcome + link to World Map)
│   ├── world/[id]/page.tsx (World Map with levels)
│   ├── level/[id]/page.tsx (full play flow)
│   └── settings/page.tsx (Export/Import)
├── components/
│   ├── game/
│   │   ├── LevelCanvas.tsx
│   │   ├── SuccessFeedback.tsx
│   │   └── FailFeedback.tsx
│   ├── world/
│   │   └── WorldMap.tsx
│   └── settings/
│       └── ProgressCodeForm.tsx
└── store/
    └── session-store.ts
```

## Testing Approach

| Type | Approach |
|------|----------|
| Unit | Reward Engine; Progress Code encode/decode |
| Integration | Full play: Level 1 → success → Level 2 unlocked |
| Manual | Export → Import → verify; World Map; responsive |
| E2E | Playwright: Welcome → World 1 → Level 1 → complete → Level 2 |

---

# Sprint Summary Table

| Sprint | Duration (Est.) | Key Deliverables |
|--------|-----------------|------------------|
| 1 | 2–3 days | Mono-repo, schema, Next.js shell, Welcome, routing |
| 2 | 3–4 days | Engine (Grid, Validator, Command, State Machine), tests |
| 3 | 3–4 days | World 1 content, Progress, level load, canvas integration |
| 4 | 3–4 days | Play loop, rewards, Progress Code, World Map, polish |

---

# Definition of Done (All Sprints)

- [ ] All tasks marked P0 completed
- [ ] Acceptance criteria met
- [ ] No architecture violations (per Phase 2)
- [ ] No new circular dependencies
- [ ] Commits follow convention: `feat(scope): description`
- [ ] Docs updated if schema or API changed

---

# NEXT STEP

→ Proceed to **Phase 6: Implementation Start** (Sprint 1, Task 1)

Await confirmation before coding.
