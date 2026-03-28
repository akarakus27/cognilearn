# AI Agent Architecture

## Internal Agents

| Agent | Role | Context Path |
|-------|------|--------------|
| Product Architect | Scope, user journeys, retention | `docs/phase-1-product-blueprint.md` |
| Learning Science | Skill mapping, difficulty curves | (future: `agents/learning-science/`) |
| Game System Architect | Engine design, contracts | `docs/phase-2-system-architecture.md`, `.cursor/rules/game-engine.mdc` |
| Frontend Architecture | Component structure, state | `.cursor/rules/frontend.mdc` |
| Backend System | API, content delivery | `docs/phase-2-system-architecture.md` |
| Content Engine | Level schema, content structure | `.cursor/rules/content.mdc` |
| DevOps / Release | Deployment, CDN | (future: `agents/devops/`) |
| Quality Control | Architecture drift, coupling | `docs/phase-2-system-architecture.md` |

## Invocation

Reference docs or rules in Cursor chat:
```
@docs/phase-2-system-architecture.md
I want to add a new engine. Where does it fit?
```
