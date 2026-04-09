# Changelog

This file tracks meaningful project changes that affect setup, workflow, architecture, or shipped scaffold behavior.

## Documentation Maintenance Rule

When preparing a commit for push that changes behavior, setup, developer workflow, or milestone status since the last push to `origin`, review and update these files together when relevant:

- `README.md`
- `docs/sprint-board.md`
- `CHANGELOG.md`

The goal is to keep the repo runnable and understandable without requiring someone to reconstruct history from commits alone.

## Unreleased

### Added

- Root `pnpm dev` command to launch the Electron desktop app and FastAPI backend together.
- Documentation for the combined dev command, local virtualenv behavior, and current scaffold startup flow.
- A real-name intake flow that creates a case, submits intake, saves settings, generates a plan, and hydrates the planning, runs, review, dossier, and graph views from the API.

### Changed

- `pnpm dev:api` now uses `apps/api/.venv` directly, so manual virtualenv activation is not required before launching the backend from root scripts.
- README and sprint board now reflect the actual scaffold status and current local run instructions.
- Electron development no longer auto-opens Chromium DevTools unless `OSINTEGRATOR_OPEN_DEVTOOLS=1` is set.
- The desktop app now uses live scaffold API responses instead of hardcoded placeholder cards.
- The FastAPI scaffold now supports local CORS in development and generates more useful case-specific stub data from the submitted intake.

### Fixed

- Removed noisy Electron DevTools protocol errors from the default `pnpm dev` experience by disabling automatic DevTools launch.

## 2026-04-08

### Added

- Initialized `OSINTegrator` as its own git repository and connected it to `https://github.com/drmbt/OSINTegrator.git`.
- Root workspace scaffold with `package.json`, `pnpm-workspace.yaml`, `Makefile`, `.env.example`, `tsconfig.base.json`, and `.gitignore`.
- Product documentation:
  - `README.md`
  - `docs/product-spec.md`
  - `docs/architecture.md`
  - `docs/system-prompt.md`
  - `docs/sprint-board.md`
- Electron + React + TypeScript desktop shell with scaffolded views for intake, planning, run monitor, review queue, dossier, graph, and settings.
- FastAPI backend scaffold with placeholder routes for:
  - case creation and retrieval
  - intake submission
  - plan generation
  - claims listing
  - evidence listing
  - tool run listing
  - provider settings
- Shared contracts package for case mode, claim status, scope checklist, and provider settings.
- JSON schema contract files for shared backend and frontend data shapes.
- Python worker scaffold and stub tool adapters for Sherlock- and SpiderFoot-style integrations.
- Local infrastructure compose file for Postgres, Memgraph, and Redis.

### Changed

- Provider settings model supports `openai`, `anthropic`, `gemini`, and `ollama` from day one of the scaffold.
- Docker validation command now skips gracefully when Docker is not installed on the machine.

### Fixed

- Removed generated Python `egg-info` artifacts from version control and added ignore rules to keep them out of future commits.

### Verified

- `pnpm install`
- `pnpm check`
- `pnpm build:desktop`
- Python compile checks for API and worker packages
- FastAPI smoke test covering health, case creation, planning, claims, evidence, tool runs, and settings

### Published

- Pushed initial scaffold commits to `origin/main`
  - `211bc55` `Initial OSINTegrator scaffold`
  - `348aba9` `Remove generated Python packaging artifacts`
