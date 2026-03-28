# PHASE 4 — AI DEVELOPMENT WORKFLOW

## Cognitive Learning Platform — Cursor + AI Daily Workflow

---

## 1. DEVELOPER WORKFLOW LOOP

```
Plan
  │
  ▼
Agent Review (optional but recommended)
  │
  ▼
Small Implementation
  │
  ▼
Validation (test / manual check)
  │
  ▼
Commit
  │
  └──────► Next task
```

### Rules

1. **Plan first** — Never start coding without a clear, scoped task.
2. **Agent review** — For architectural changes, invoke relevant agent (e.g., game-system, content-engine).
3. **Small implementation** — One file or one feature at a time. No large dumps.
4. **Validate** — Run tests or manual check before commit.
5. **Commit** — Small, atomic commits. Clear messages.

---

## 2. AGENT INVOCATION

### When to Use Each Agent

| Agent | When to Invoke |
|-------|----------------|
| **Product Architect** | Scope changes, new user journeys, feature prioritization |
| **Learning Science** | Level design, difficulty curves, skill mapping |
| **Game System** | Engine changes, new engines, validator logic |
| **Frontend** | Component structure, state management, routing |
| **Backend** | API design, data models, deployment |
| **Content Engine** | Level schema, content structure, new worlds |
| **DevOps** | Deployment, env, CDN, CI |
| **Quality Control** | Before merge; architecture drift check |

### How to Invoke

Use Cursor chat with context:

```
@docs/phase-2-system-architecture.md
I want to add a new Grid Engine method for pathfinding.
What's the right place and contract?
```

Or reference agent context:

```
@agents/game-system/CONTEXT.md
Review this change to the Command Execution Engine.
```

---

## 3. PROMPTING STRATEGY INSIDE CURSOR

### 3.1 Starting a Task

**Template:**
```
Task: [One-sentence description]
Scope: [File(s) or package affected]
Constraint: [Architecture rule or limit]
Expected output: [What success looks like]
```

**Example:**
```
Task: Add Grid Engine cell validation
Scope: packages/game-engine/src/grid.ts
Constraint: No UI imports; pure function
Expected output: isValidCell(x, y) returns boolean
```

### 3.2 Review Request

**Template:**
```
Please review this change for:
- [ ] Architecture compliance
- [ ] [Specific concern]
Files: [list]
```

### 3.3 Refactor Request

**Template:**
```
Refactor: [What to change]
Current: [File/function]
Target: [Desired structure]
Constraint: [No breaking changes / small steps]
```

### 3.4 Anti-Patterns (What NOT to Ask)

| ❌ Bad | ✅ Good |
|--------|---------|
| "Build the whole game" | "Add level load in game-engine" |
| "Fix everything" | "Fix validation in puzzle-validator.ts" |
| "Optimize" (vague) | "Reduce re-renders in LevelCanvas" |
| "Add feature X" (unscoped) | "Add feature X: file Y, function Z" |

---

## 4. CURSOR RULES (Project-Specific)

Rules live in `.cursor/rules/` and apply automatically.

### 4.1 Core Workflow Rule

- **File:** `workflow.mdc`
- **alwaysApply:** true
- **Content:** Plan → Agent review → Small implementation → Validate → Commit

### 4.2 Game Engine Rule

- **File:** `game-engine.mdc`
- **globs:** `packages/game-engine/**/*.ts`
- **Content:** No UI/framework imports; pure logic; testable

### 4.3 Content Rule

- **File:** `content.mdc`
- **globs:** `content/**/*.json`
- **Content:** Follow content-schema; no logic in JSON

### 4.4 Frontend Rule

- **File:** `frontend.mdc`
- **globs:** `apps/web/**/*.tsx`
- **Content:** Component isolation; no game logic in UI

---

## 5. SAFETY RULES

### If Random Feature Requested

**STOP.** Respond with:

```
HALT — Architectural evaluation needed.

Requested: [feature]
Impact: [potential scope]
Proposed: [evaluate with Agent X before implementation]

Continue? Y/N
```

### If Architecture Becomes Unstable

**STOP development.** Escalate to Quality Control agent. Document drift. Propose refactor plan before continuing.

---

## 6. COMMIT CONVENTIONS

| Type | Example |
|------|---------|
| feat | `feat(game-engine): add isValidCell to Grid` |
| fix | `fix(ui): prevent double render on level load` |
| refactor | `refactor(content-schema): extend LevelSchema` |
| docs | `docs: update phase-2 architecture` |

---

## 7. NEXT STEP AFTER APPROVAL

When you approve Phase 1–4:

**Phase 5** — MVP Sprint System (4 sprints, tasks, acceptance criteria)  
**Phase 6** — Implementation Start (Sprint 1, Task 1)

Before coding, always output:

```
NEXT SAFE STEP:
FILES TO CREATE:
WHY:
```

---

## READY FOR CONFIRMATION

Phases 1–4 complete. Awaiting your approval to proceed to Phase 5 (MVP Sprints) and Phase 6 (Implementation).
