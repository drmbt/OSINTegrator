# Sprint Board

## Sprint 1: Project Foundation

- [ ] initialize isolated repo and connect GitHub remote
- [ ] scaffold workspace and root scripts
- [ ] add README, product docs, architecture notes, and planner prompt
- [ ] create intake-focused desktop shell
- [ ] create FastAPI skeleton with versioned routes
- [ ] define shared contracts for cases, claims, tool runs, and provider settings

## Sprint 2: Investigation Model

- [ ] implement case creation and local persistence strategy
- [ ] model raw signals, claims, evidence, and tool runs
- [ ] add mode toggle and auto-accept threshold support
- [ ] flesh out scope checklist with required / preferred / ignore / unknown states
- [ ] implement initial confidence scoring helpers

## Sprint 3: Review Queue and Dossier

- [ ] build claim cards with provenance, confidence, and status controls
- [ ] add canonical versus provisional labels
- [ ] support approve / reject / defer workflows
- [ ] render dossier summary panels from placeholder case data

## Sprint 4: Graph and Planning

- [ ] visualize planner task groups and run phases
- [ ] connect graph view to placeholder nodes and edges
- [ ] show stopping conditions and exceptions for Agent Mode
- [ ] support rerun / retry affordances

## Sprint 5: Real Tool Adapters

- [ ] replace stub adapters with first live integrations
- [ ] log adapter runs and normalize outputs
- [ ] surface evidence imports through the review queue
- [ ] project approved findings into Postgres and Memgraph

## Backlog

- [ ] timeline reconstruction
- [ ] local secrets storage
- [ ] browser-use automation
- [ ] semantic dossier search
- [ ] export to markdown / PDF / JSON bundle
- [ ] multi-case and multi-entity workflows
