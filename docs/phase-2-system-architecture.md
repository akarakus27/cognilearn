# PHASE 2 — SYSTEM ARCHITECTURE

## Cognitive Learning Platform — Full Platform Design

---

## 1. HIGH-LEVEL PLATFORM DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                         FRONTEND (Next.js App Router)                        ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ ││
│  │  │   Pages     │ │  Components │ │ Game Canvas │ │  State Management       │ ││
│  │  │  /world     │ │  (Isolated) │ │   Layer     │ │  (Zustand / Context)    │ ││
│  │  │  /level     │ │             │ │             │ │                         │ ││
│  │  └─────────────┘ └─────────────┘ └──────┬──────┘ └────────────┬────────────┘ ││
│  └─────────────────────────────────────────┼─────────────────────┼──────────────┘│
└────────────────────────────────────────────┼─────────────────────┼───────────────┘
                                             │                     │
                                             ▼                     │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              GAME ENGINE LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                      GAME ENGINE (Framework-Agnostic)                         ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ ││
│  │  │ Grid Engine │ │ Command     │ │ Puzzle      │ │ Level State Machine     │ ││
│  │  │             │ │ Execution   │ │ Validator   │ │                         │ ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘ ││
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                      Reward Engine                                       │ ││
│  │  └─────────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                           │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │   CONTENT SYSTEM    │  │   PROGRESS SYSTEM   │  │   BACKEND (FastAPI)     │  │
│  │                     │  │                     │  │                         │  │
│  │  content/           │  │  LocalStorage       │  │  Level delivery         │  │
│  │    worlds/          │  │  Progress Code      │  │  Content versioning     │  │
│  │    algorithm/       │  │  (Encode/Decode)    │  │  Analytics-ready        │  │
│  │    chess/           │  │                     │  │  (Future)               │  │
│  │    unplugged/       │  │                     │  │                         │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT RESPONSIBILITIES

### 2.1 FRONTEND

| Responsibility | Description | Rules |
|----------------|-------------|-------|
| **Routing** | App Router; `/`, `/world/[id]`, `/level/[id]` | No game logic in routes |
| **Components** | UI primitives; layout; game canvas wrapper | Isolated; no engine coupling |
| **Game Canvas** | Renders engine state; captures input | Thin adapter to engine |
| **State** | Session state; UI state; progress read/write | Never compute level validity |

**RULE:** UI must never contain game logic. It only displays and forwards input.

---

### 2.2 GAME ENGINE

| Engine | Responsibility | Inputs | Outputs |
|--------|----------------|--------|---------|
| **Grid Engine** | Manages 2D grid; cells; movement rules | Grid config, actions | Grid state |
| **Command Execution Engine** | Runs sequence of commands; step-by-step | Commands, grid state | Execution result |
| **Puzzle Validator** | Checks if solution solves level | User solution, level solution | Valid/Invalid + feedback |
| **Level State Machine** | Level lifecycle (intro → play → result) | Events | Current state |
| **Reward Engine** | Computes stars, XP, unlocks | Performance, level meta | Rewards |

**RULE:** Game logic must NEVER depend on UI or framework. Pure TypeScript/JS.

---

### 2.3 CONTENT SYSTEM

| Responsibility | Description | Format |
|----------------|-------------|--------|
| **Level Schema** | Universal structure for all level types | JSON Schema |
| **World Definitions** | Metadata; unlock rules; level list | JSON |
| **Level Content** | Puzzles; chess positions; commands | JSON |
| **Versioning** | Content version for cache invalidation | Semantic version |

**Structure:**
```
content/
  worlds/
  algorithm/
  chess/
  unplugged/
```

**RULE:** Levels live in content, not in code. Future: AI-generated levels.

---

### 2.4 PROGRESS SYSTEM

| Component | Responsibility | Storage |
|-----------|----------------|---------|
| **LocalStorage** | Current device progress | Browser |
| **Progress Code** | Shareable, portable state | User copies |
| **Codec** | Encode/decode progress ↔ code | Pure function |

**Progress Code Format:** Compact string (base64/compressed) containing:
- World unlock state
- Level completion (stars)
- Aggregate XP
- Checksum for integrity

**RULE:** No PII. Parent-controlled. Device-independent via code.

---

### 2.5 BACKEND (MVP: Minimal)

| Responsibility | Description | MVP Scope |
|----------------|-------------|-----------|
| **Level Delivery** | Serve content JSON | Optional (CDN possible) |
| **Content Versioning** | Version headers for cache | Yes |
| **Analytics-Ready** | Structured events; no identity | Schema only; no ingestion yet |
| **Progress Code Validation** | Decode + integrity check | Optional API |

**Framework:** FastAPI  
**MVP:** May be static content (CDN); backend deferred if content is bundled.

---

## 3. DATA FLOW

### 3.1 Level Load Flow

```
User selects level
       │
       ▼
Frontend fetches level JSON (content or API)
       │
       ▼
Engine loads level schema → initializes state
       │
       ▼
UI renders engine state
```

### 3.2 Play Flow

```
User input (click, drag, command)
       │
       ▼
Frontend forwards to Engine
       │
       ▼
Engine: Grid / Command / Validator updates state
       │
       ▼
Engine emits state change
       │
       ▼
UI re-renders (reactive)
```

### 3.3 Completion Flow

```
Puzzle Validator → Success
       │
       ▼
Reward Engine → stars, XP, unlock
       │
       ▼
Progress System → LocalStorage update
       │
       ▼
UI shows feedback + next level
```

---

## 4. BOUNDARY CONTRACT

| From | To | Contract |
|------|----|----------|
| Frontend | Engine | `loadLevel(levelId)`, `executeAction(action)`, `getState()` |
| Engine | Content | `LevelSchema` (JSON) |
| Engine | Progress | `recordCompletion(levelId, stars)` (via Frontend) |
| Frontend | Progress | `loadProgress()`, `saveProgress(data)`, `exportCode()`, `importCode(code)` |
| Frontend | Backend | `GET /content/level/:id` (optional) |

---

## 5. FUTURE EXPANSION POINTS

| Future Module | Integration Point |
|---------------|-------------------|
| Adult Brain Training | New `content/adult/`; same engine |
| Senior Cognitive Mode | New content; difficulty curve |
| AI Tutor | Engine exposes state; backend LLM |
| School Dashboard | Backend: auth, progress sync |
| Plugins/Modules | Content namespace; engine extensibility |

**Architecture must support:** New content folders, new level types, new engines (e.g., Chess engine) without rewriting core.

---

## NEXT STEP

→ Proceed to **Phase 3: Repository Design**
