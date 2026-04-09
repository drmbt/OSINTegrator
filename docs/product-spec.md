# Product Spec

## Product Framing

OSINTegrator is a Cursor-like OSINT workstation with two operating modes:

- `Review Mode`: evidence-first and approval-heavy
- `Agent Mode`: autonomous looping with provisional auto-acceptance

The app should feel like an investigation IDE rather than a chatbot or scraper dashboard. Users move through intake, planning, execution, review, dossier editing, and graph exploration in one workspace.

## Primary Goals

- Accept messy starting fragments without forcing investigators into rigid schemas on day one.
- Preserve provenance for every claim and surface the evidence behind every conclusion.
- Let users scope a search with a checklist of targets such as social profiles, employers, university history, public writing, and relationship links.
- Support both conservative review workflows and faster exploratory agent loops.

## Core Objects

- `Case`: an investigation workspace with mode, thresholds, and scope preferences
- `Raw Signal`: user-provided fragments or captured tool output
- `Entity`: a person, organization, account, document, location, or related node
- `Claim`: an evidence-backed assertion with status and confidence
- `Evidence`: the atomic source item that supports a claim
- `Tool Run`: an executed module or worker task with parameters and output

## MVP Surfaces

- Intake Wizard
- Planning View
- Run Monitor
- Review Queue
- Dossier Workspace
- Graph View
- Settings

## Checklist Priorities

Each checklist category should support `required`, `preferred`, `ignore`, and `unknown`.

Suggested categories:

- identity and aliases
- date or year of birth
- social accounts
- LinkedIn and professional traces
- education history
- employment history
- family or known associates
- public writing and articles
- internet footprint and domains
- broad discovery versus precision

## Mode Behavior

### Review Mode

- all findings stay pending
- canonical truth changes only after human approval
- contradictions are highlighted early

### Agent Mode

- high-confidence findings may enter a provisional layer automatically
- the agent continues pivoting until it hits stop conditions
- contradictions and identity collisions pause the loop

## Non-Goals for the Initial Scaffold

- full tool execution
- browser-use automation
- secure secrets storage
- production-ready authentication or multi-user collaboration
