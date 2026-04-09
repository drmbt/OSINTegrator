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

### Install JavaScript Workspace Dependencies

```bash
pnpm install
```

### Create a Python Virtual Environment

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

### Start the Desktop Shell

```bash
pnpm dev:desktop
```

### Start the API

```bash
pnpm dev:api
```

### Validate Infrastructure Config

```bash
pnpm check:docker
```

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
