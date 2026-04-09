# Sprint Board

## Sprint 1: Project Foundation

- [x] initialize isolated repo and connect GitHub remote
- [x] scaffold workspace and root scripts
- [x] add README, product docs, architecture notes, and planner prompt
- [x] create intake-focused desktop shell
- [x] create FastAPI skeleton with versioned routes
- [x] define shared contracts for cases, claims, tool runs, and provider settings

## Sprint 2: Investigation Model

- [x] implement case creation and local persistence strategy
- [x] model raw signals, claims, evidence, and tool runs
- [x] add mode toggle and auto-accept threshold support
- [x] flesh out scope checklist with required / preferred / ignore / unknown states
- [ ] implement initial confidence scoring helpers

## Sprint 3: Review Queue and Dossier

- [x] build claim cards with provenance, confidence, and status controls
- [x] add canonical versus provisional labels
- [ ] support approve / reject / defer workflows
- [x] render dossier summary panels from placeholder case data

## Sprint 4: Graph and Planning

- [x] visualize planner task groups and run phases
- [x] connect graph view to placeholder nodes and edges
- [x] show stopping conditions and exceptions for Agent Mode
- [ ] support rerun / retry affordances

## Sprint 5: Real Tool Adapters

- [x] add stub adapter interface and placeholder worker integrations
- [ ] replace stub adapters with first live integrations
- [x] log adapter runs and normalize outputs
- [ ] surface evidence imports through the review queue
- [ ] project approved findings into Postgres and Memgraph

## Current Status

- [x] repo isolated from parent worktree and pushed to `origin/main`
- [x] root `pnpm dev` command added to launch both desktop and API together
- [x] API startup uses the repo-local `apps/api/.venv` directly
- [x] desktop build, TypeScript checks, Python compile checks, and API smoke test completed
- [x] wire the desktop shell to the live FastAPI placeholder endpoints
- [x] replace hardcoded desktop placeholder data with API-backed state
- [x] create a real-name intake flow that hydrates planning, runs, review, dossier, and graph views
- [ ] add first confidence scoring implementation and review actions
- [ ] add approve / reject / defer mutations to the review queue
- [ ] persist case state across app restarts

## Documentation Rule

- [x] README, sprint board, and changelog should be updated when meaningful setup, workflow, or milestone changes are prepared for push

## Backlog

- [ ] timeline reconstruction
- [ ] local secrets storage
- [ ] browser-use automation
- [ ] semantic dossier search
- [ ] export to markdown / PDF / JSON bundle
- [ ] multi-case and multi-entity workflows
