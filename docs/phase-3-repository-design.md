# PHASE 3 — REPOSITORY DESIGN (CURSOR OPTIMIZED)

## Cognitive Learning Platform — Mono-Repo Structure

---

## 1. ROOT STRUCTURE

```
cognitive-platform/
│
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # FastAPI backend
│
├── packages/
│   ├── game-engine/            # Core game logic (framework-agnostic)
│   ├── ui/                     # Shared UI components
│   ├── content-schema/         # Level & world schema definitions
│   └── utils/                  # Shared utilities (codec, validation)
│
├── content/                    # Level content (JSON)
│   ├── worlds/
│   ├── algorithm/
│   ├── chess/
│   └── unplugged/
│
├── agents/                     # Agent definitions & prompts
│   ├── product-architect/
│   ├── learning-science/
│   ├── game-system/
│   ├── frontend/
│   ├── backend/
│   ├── content-engine/
│   ├── devops/
│   └── quality-control/
│
├── docs/                       # Architecture & planning docs
│   ├── phase-1-product-blueprint.md
│   ├── phase-2-system-architecture.md
│   ├── phase-3-repository-design.md
│   ├── phase-4-ai-workflow.md
│   └── prd.md
│
├── .cursor/
│   └── rules/                  # Cursor rules for project
│
├── package.json                # Root workspace config (pnpm/npm workspaces)
├── pnpm-workspace.yaml
└── README.md
```

---

## 2. WHY EACH EXISTS

### 2.1 `apps/`

| Path | Purpose | Rationale |
|------|---------|-----------|
| **apps/web** | Next.js consumer-facing app | Single deployable; App Router; SSR/SSG |
| **apps/api** | FastAPI service for content/analytics | Separable deploy; Render/Fly.io |

**Why apps/:** Clear boundary between deployables. Frontend and backend can evolve independently.

---

### 2.2 `packages/`

| Package | Purpose | Rationale |
|---------|---------|-----------|
| **game-engine** | Grid, Command, Validator, Reward, State Machine | Framework-agnostic; testable; reusable |
| **ui** | Shared components (buttons, layout, game canvas) | Consistency; single source of truth |
| **content-schema** | JSON Schema + TypeScript types for levels | Content-driven; versioned schema |
| **utils** | Codec (Progress Code), validation, helpers | Shared logic; no duplication |

**Why packages/:** Shared code is versioned together. Changes propagate via workspace links. Cursor can edit small, isolated packages.

---

### 2.3 `content/`

| Path | Purpose | Rationale |
|------|---------|-----------|
| **content/worlds** | World metadata, level lists | Central place for progression |
| **content/algorithm** | Algorithmic-thinking level JSON | Content-driven; no logic in code |
| **content/chess** | Chess level definitions | Same schema; different domain |
| **content/unplugged** | Unplugged coding levels | Same schema; different domain |

**Why content/:** Levels live outside code. Non-developers can add/edit. Future: AI-generated levels. CDN cacheable.

---

### 2.4 `agents/`

| Path | Purpose | Rationale |
|------|---------|-----------|
| **product-architect** | Scope, user journeys, retention | Product decisions documented |
| **learning-science** | Skill mapping, difficulty curves | Pedagogy guidance |
| **game-system** | Engine design decisions | Technical consistency |
| **frontend** | Component rules, state strategy | Prevent React chaos |
| **backend** | API design, scaling | Minimal but scalable |
| **content-engine** | Level schema, content structure | Content scalability |
| **devops** | Deploy, env, CDN | Day-one deployment |
| **quality-control** | Drift checks, complexity | Early warning |

**Why agents/:** Each agent has a role. Cursor can invoke agent context via rules. Prevents vibe coding.

---

### 2.5 `docs/`

| Path | Purpose | Rationale |
|------|---------|-----------|
| **phase-*.md** | Phase outputs | Single source of truth for decisions |
| **prd.md** | Product requirements | Canonical scope |

**Why docs/:** Architecture decisions are recorded. New contributors (or AI) can onboard via docs.

---

### 2.6 `.cursor/rules/`

| Path | Purpose | Rationale |
|------|---------|-----------|
| **rules/** | Project-specific Cursor rules | Enforce workflow; prevent drift |

**Why .cursor/rules/:** Cursor reads rules automatically. Ensures Plan → Agent review → Small implementation.

---

## 3. PACKAGE DEPENDENCY GRAPH

```
apps/web
  ├── @cognitive/ui
  ├── @cognitive/game-engine
  ├── @cognitive/content-schema
  └── @cognitive/utils

apps/api
  ├── @cognitive/content-schema
  └── @cognitive/utils

packages/game-engine
  ├── @cognitive/content-schema
  └── @cognitive/utils

packages/ui
  └── @cognitive/utils (optional)

packages/content-schema
  └── (none)

packages/utils
  └── (none)
```

**Rule:** No circular dependencies. `game-engine` never imports from `web` or `api`.

---

## 4. FILE CONVENTIONS

| Convention | Example |
|------------|---------|
| **Package entry** | `packages/game-engine/src/index.ts` |
| **Level content** | `content/algorithm/level-001.json` |
| **Agent context** | `agents/game-system/CONTEXT.md` |
| **Cursor rule** | `.cursor/rules/game-engine.mdc` |

---

## 5. CURSOR OPTIMIZATION

### Small Context Windows

- Each package is small. Cursor loads one package at a time.
- Content files are small JSON. Easy to edit.
- Docs are modular. Reference specific phases.

### Incremental Edits

- Edit one file at a time when possible.
- Refactor in small steps. Never rewrite entire packages in one go.

### File Paths Always Specified

- All generated outputs include exact file paths.
- Example: "Create `packages/game-engine/src/grid.ts`" — not "create grid logic."

---

## NEXT STEP

→ Proceed to **Phase 4: AI Development Workflow**
