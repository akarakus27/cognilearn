# PHASE 1 — PRODUCT BLUEPRINT

## Cognitive Learning Platform (MVP)

---

## 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1.1 Product Name & Vision

**Working Title:** Cognitive Learning Platform  
**Vision:** A lifelong cognitive development ecosystem.

### 1.2 Target Users (MVP)

| Attribute | Value |
|-----------|-------|
| Primary | Children aged 6–12 |
| Device | Web browser (desktop/tablet) |
| Context | Home learning, school supplement, parent-guided |

### 1.3 Core Value Proposition

> Deliver age-appropriate cognitive challenges through gamified, unplugged activities—developing algorithmic thinking, problem-solving, and chess fundamentals without screens as a barrier.

### 1.4 Learning Areas (MVP Scope)

| Module | Description | Age Appropriateness |
|--------|-------------|---------------------|
| **Algorithmic Thinking** | Sequences, loops, conditionals via visual puzzles | 6–12 |
| **Unplugged Coding Logic** | Physical-style logic without keyboards | 6–12 |
| **Problem Solving** | Pattern recognition, spatial reasoning | 6–12 |
| **Chess Fundamentals** | Piece movement, basic tactics, board awareness | 6–12 |

### 1.5 MVP Constraints

| Constraint | Decision | Rationale |
|------------|----------|-----------|
| Authentication | None | Reduce friction; focus on learning experience |
| Data Storage | LocalStorage + Shareable Progress Code | Offline-first; parent-controlled; portable |
| Platform | Web (responsive) | Maximum reach; no app store dependency |

### 1.6 Success Metrics (MVP)

- **Engagement:** Session duration, levels completed per session
- **Retention:** Return rate within 7 days
- **Progression:** % of users reaching mid-world completion
- **Shareability:** Adoption of Progress Code sharing

---

## 2. USER FLOW

### 2.1 First-Time User Journey

```
Land on Platform
       │
       ▼
┌──────────────────┐
│  Welcome Screen  │  ← Brief intro; no signup
│  "Start Learning"│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ World Selection  │  ← Choose starting world (or auto-start)
│ or Auto-Assign   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Level 1 Play    │  ← First puzzle/activity
│  (Tutorial)      │
└────────┬─────────┘
         │
         ▼
   ┌─────┴─────┐
   │  Success  │──────► Next Level
   │  Feedback │
   └───────────┘
```

### 2.2 Core Loop (Per Session)

1. **Select** — Choose world or continue last position
2. **Play** — Complete level (puzzle/game)
3. **Validate** — Engine checks solution
4. **Reward** — Stars, XP, unlock next
5. **Decide** — Next level, new world, or exit

### 2.3 Key User Paths

| Path | Flow |
|------|------|
| **New Session** | Home → World Map → Level → Play → Reward |
| **Resume** | Home → Last World/Level (from LocalStorage) |
| **Share Progress** | Settings → Export Progress Code → Copy/Share |
| **Import Progress** | Settings → Paste Progress Code → Confirm → Load |

### 2.4 Exit Points

- After each level (natural pause)
- World completion celebration
- "Save & Quit" (auto-saves; no explicit save needed)

---

## 3. WORLD PROGRESSION MODEL

### 3.1 World Structure

```
World 1: "First Steps" (Algorithmic Intro)
   └── Levels 1–10 (sequences, simple commands)

World 2: "Logic Land" (Unplugged Coding)
   └── Levels 11–20 (conditions, loops)

World 3: "Puzzle Peak" (Problem Solving)
   └── Levels 21–30 (patterns, spatial)

World 4: "Chess Castle" (Chess Fundamentals)
   └── Levels 31–40 (pieces, moves, tactics)
```

### 3.2 Level Unlock Rules

- **Linear within world:** Complete N to unlock N+1
- **World unlock:** Complete final level of previous world
- **Optional:** Hidden levels / bonus challenges (future)

### 3.3 Difficulty Curve

| World | Difficulty Band | Cognitive Load |
|-------|-----------------|----------------|
| 1 | Very Easy → Easy | Low |
| 2 | Easy → Medium | Medium |
| 3 | Medium | Medium–High |
| 4 | Medium → Medium–High | Medium–High |

---

## 4. ENGAGEMENT LOOP

### 4.1 Short Loop (Per Level)

```
Challenge → Attempt → Success/Fail → Feedback → Next
     ▲                                         │
     └─────────────────────────────────────────┘
              (Retry on fail; no punishment)
```

### 4.2 Medium Loop (Session)

```
Start Session → Complete 1–5 Levels → Earn Stars/XP → Unlock Preview → End
```

### 4.3 Long Loop (Retention)

| Mechanism | Implementation |
|-----------|----------------|
| **Progression** | Visible world map; "3 more to unlock World 2" |
| **Achievement** | Stars per level; world completion badge |
| **Curiosity** | Locked world previews; "Coming soon" teasers |
| **Portability** | Progress Code = no loss when changing device |

### 4.4 Gamification Elements (MVP)

| Element | Use |
|---------|-----|
| Stars (1–3) | Per-level performance |
| XP | Aggregate progress (optional display) |
| World Badge | Completion reward |
| Progress Code | Share/backup; no in-game currency |

### 4.5 Non-Punitive Design

- No timers (initially)
- Unlimited retries
- Hints available (future)
- Failure = learning; no "game over" penalty

---

## PRODUCT_DECISION SUMMARY

| Decision | Rationale | Risks |
|----------|-----------|-------|
| No auth for MVP | Speed to market; focus on learning | Progress tied to device; mitigated by Progress Code |
| LocalStorage + Progress Code | Simplicity; parent control | Code loss; manual backup |
| 4 worlds, ~10 levels each | Manageable scope; clear structure | May feel short; extensible |
| Web-only MVP | Cross-platform; no app store | Mobile UX may need refinement |
| Stars + Badges | Lightweight gamification | Avoid over-gamification |

---

## NEXT STEP

→ Proceed to **Phase 2: System Architecture**
