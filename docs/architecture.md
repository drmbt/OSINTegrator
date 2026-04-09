# Architecture Notes

## High-Level Stack

- Desktop shell: Electron + React + TypeScript
- API: FastAPI
- Queue / worker coordination: Redis + Python worker stubs
- Canonical persistence target: Postgres
- Graph projection target: Memgraph
- Shared contracts: JSON schema + TypeScript + Python constants

## Data Direction

1. Users submit raw signals and scope preferences.
2. Planner normalizes intake into case context and task groups.
3. Tool adapters emit evidence and candidate claims.
4. Review Mode keeps claims pending.
5. Agent Mode may promote high-confidence claims into a provisional layer.
6. Approved or promoted claims eventually project into Postgres and Memgraph.

## Contract Strategy

The scaffold keeps cross-language contracts in `packages/shared/contracts`.

- TypeScript consumes shared constants and types from `packages/shared/src`.
- Python consumes matching enums and schema paths from `packages/shared/python`.

This keeps the desktop and backend aligned without forcing a code generation pipeline into the first commit.

## Repo Layout

```text
apps/
  api/
  desktop/
docs/
infra/
packages/
  shared/
services/
  workers/
```

## First Real Integrations

The first tool adapters should remain replaceable and independently runnable:

- `sherlock`
- `spiderfoot`

Stub adapters in the scaffold should mimic the shape of real evidence, claims, and tool run records so the UI and API can advance before the external dependencies are installed.
