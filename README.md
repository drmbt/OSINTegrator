# OSINTegrator

OSINTegrator is a local-first OSINT IDE for turning messy signals into a reviewable, evidence-backed dossier. It combines a desktop investigation workspace, modular tool adapters, a relational source-of-truth store, and a graph projection layer so investigators can move between intake, planning, execution, review, and graph exploration without leaving the app.

The product is intentionally designed around two modes:

- `Review Mode`: every finding stays pending until a human approves it.
- `Agent Mode`: the system keeps looping through scoped tasks and auto-accepts provisional findings above a chosen threshold.

## Architecture Overview

- `apps/desktop`: Electron + React + TypeScript desktop shell
- `apps/api`: FastAPI backend with placeholder investigation routes
- `packages/shared`: shared contracts, schema files, and cross-language constants
- `services/workers`: worker and adapter stubs for OSINT tools
- `infra`: local development services for Postgres, Memgraph, and Redis
- `docs`: product spec, architecture notes, sprint board, and planner prompt

Postgres is the intended canonical source of truth. Memgraph is the graph projection and exploration layer. Redis supports queueing and worker coordination.

## Provider Settings

The scaffold includes a settings model that supports bring-your-own providers:

- `openai`
- `anthropic`
- `gemini`
- `ollama`

Hosted providers use an API key field. Ollama uses a base URL and model identifier. The initial scaffold stores provider settings as local configuration placeholders; secure secrets storage is a follow-up milestone.

## Local Setup

### Prerequisites

- Node.js 20+
- `pnpm` 9+
- Python 3.11+
- Docker Desktop or compatible `docker compose`

### One-Time Setup on a Fresh Clone

```bash
pnpm install
cd apps/api
python3 -m venv .venv
./.venv/bin/pip install -e .
cd ../..
```

### Running the Scaffold

```bash
pnpm dev
```

The root `dev` command starts both:

- the Electron desktop shell
- the FastAPI backend

### Other Useful Commands

```bash
pnpm dev:desktop
pnpm dev:api
pnpm check
pnpm build:desktop
```

### Command Guide

- `pnpm dev`
  Starts both the desktop app and API together.
- `pnpm dev:desktop`
  Starts just the Electron/Vite desktop shell.
- `pnpm dev:api`
  Starts just the FastAPI backend using `apps/api/.venv` directly, so you do not need to manually activate the virtual environment.
- `OSINTEGRATOR_OPEN_DEVTOOLS=1 pnpm dev:desktop`
  Opens Chromium DevTools automatically during desktop development when you explicitly want it.
- `pnpm check`
  Runs the shared build, desktop typecheck, API compile check, and Docker config validation when Docker is available.
- `pnpm check:docker`
  Validates `infra/docker-compose.yml` when Docker is installed on the machine. If Docker is missing from `PATH`, the check is skipped.

By default, DevTools no longer auto-open on startup. This avoids noisy Electron DevTools protocol errors that were showing up even though the scaffold app itself was fine.

### Current Local Workspace Notes

In this working copy, the following setup has already been done:

- `pnpm install`
- creation of `apps/api/.venv`
- `./.venv/bin/pip install -e .` inside `apps/api`

That means you can launch the scaffold immediately with:

```bash
pnpm dev
```

### Provider Requirements

You do not need an API key or a local Ollama instance to run the current scaffold.

- The settings page already models `openai`, `anthropic`, `gemini`, and `ollama`.
- Those settings are placeholders right now.
- The current desktop shell does not yet call live LLM providers.

## Working Model

1. Capture raw signals and scope preferences in the intake wizard.
2. Generate a grouped plan aligned to the checklist and operating mode.
3. Run tool adapters and convert results into evidence-backed claims.
4. Review or auto-accept findings depending on case mode.
5. Project approved data into the dossier and graph layers.

## Initial Vertical Slice

This scaffold is aimed at the first runnable slice:

- create a case
- capture intake with a scope checklist
- store planner preferences and provider settings
- generate a placeholder plan
- view claims, evidence, and tool runs through a consistent API contract
- navigate a desktop shell with dossier, graph, and review placeholders

## Repository Status

This repo was initialized as its own git repository inside `/Users/vincentnaples/Documents/github/OSINTegrator` so it no longer inherits the parent worktree.

## Documentation Maintenance Rule

When preparing a commit that changes user-facing behavior, setup, workflow, or milestone status since the last push to `origin`, update the relevant project docs in the same change set:

- `README.md` for install, run, setup, and usage changes
- `docs/sprint-board.md` for progress and next-step status
- `CHANGELOG.md` for a concise summary of meaningful project changes

This rule is especially important for publish requests. If a commit changes how the project is launched, configured, verified, or understood, these documents should be reviewed and updated before pushing.
