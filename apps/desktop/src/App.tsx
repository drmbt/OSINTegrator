import React from "react";

import {
  CASE_MODES,
  CLAIM_STATUSES,
  DEFAULT_SCOPE_CHECKLIST,
  PROVIDERS,
  type CaseMode,
  type PriorityState,
  type ProviderSettings
} from "@osintegrator/shared";

type ViewKey =
  | "intake"
  | "planning"
  | "runs"
  | "review"
  | "dossier"
  | "graph"
  | "settings";

const views: Array<{ key: ViewKey; label: string; blurb: string }> = [
  {
    key: "intake",
    label: "Intake Wizard",
    blurb: "Capture messy inputs, checklist targets, and case mode."
  },
  {
    key: "planning",
    label: "Planning View",
    blurb: "Group tasks into passes with expected yield and breakpoints."
  },
  {
    key: "runs",
    label: "Run Monitor",
    blurb: "Track worker passes, queue state, and tool summaries."
  },
  {
    key: "review",
    label: "Review Queue",
    blurb: "Approve or reject evidence-backed claims before canonization."
  },
  {
    key: "dossier",
    label: "Dossier Workspace",
    blurb: "Switch between canonical and provisional knowledge layers."
  },
  {
    key: "graph",
    label: "Graph View",
    blurb: "Inspect people, organizations, and relationships visually."
  },
  {
    key: "settings",
    label: "Settings",
    blurb: "Configure provider selection, model settings, and thresholds."
  }
];

const planSteps = [
  {
    title: "Identity Resolution Pass",
    detail: "Normalize names, aliases, usernames, and profile URLs."
  },
  {
    title: "Professional Trace Pass",
    detail: "Prioritize LinkedIn, employers, education, and public bios."
  },
  {
    title: "Public Writing Pass",
    detail: "Search for authored articles, interviews, and press mentions."
  },
  {
    title: "Graph Projection",
    detail: "Convert approved findings into dossier and relationship views."
  }
];

const toolRuns = [
  { name: "planner.normalize_intake", status: "completed", summary: "Created 7 candidate signals and 4 task groups." },
  { name: "worker.stub_sherlock", status: "queued", summary: "Waiting for username batch and provider settings." },
  { name: "worker.stub_spiderfoot", status: "queued", summary: "Ready for domain and social footprint exploration." }
];

const reviewItems = [
  {
    claim: "Jane Example is likely associated with Acme Labs.",
    status: CLAIM_STATUSES[0],
    confidence: 0.78,
    evidence: "Matched profile summary and company domain on two sources."
  },
  {
    claim: "jane.example@acme.test appears to be a professional contact point.",
    status: CLAIM_STATUSES[3],
    confidence: 0.86,
    evidence: "Stub adapter surfaced a repeated domain pattern and LinkedIn hint."
  }
];

const dossierBlocks = [
  "Identity summary",
  "Employers and roles",
  "Education",
  "Public writing",
  "Social accounts",
  "Notes and unresolved contradictions"
];

const graphNodes = ["Target", "Employer", "University", "LinkedIn", "Article"];

const defaultSettings: ProviderSettings = {
  provider: "openai",
  apiKey: "",
  baseUrl: "http://127.0.0.1:11434",
  model: "llama3.2",
  modeDefault: "review",
  autoAcceptThreshold: 0.82
};

function App() {
  const [activeView, setActiveView] = React.useState<ViewKey>("intake");
  const [mode, setMode] = React.useState<CaseMode>("review");
  const [providerSettings, setProviderSettings] = React.useState(defaultSettings);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">OSINT IDE</p>
          <h1>OSINTegrator</h1>
          <p className="lede">
            Local-first investigations with scoped planning, evidence-backed claims,
            and dual review or agent workflows.
          </p>
        </div>

        <div className="mode-card">
          <span className="eyebrow">Case Mode</span>
          <div className="mode-toggle">
            {CASE_MODES.map((caseMode) => (
              <button
                key={caseMode}
                className={caseMode === mode ? "tab active" : "tab"}
                onClick={() => {
                  setMode(caseMode);
                  setProviderSettings((current) => ({
                    ...current,
                    modeDefault: caseMode
                  }));
                }}
                type="button"
              >
                {caseMode}
              </button>
            ))}
          </div>
          <p className="small">
            Review Mode holds findings for approval. Agent Mode auto-promotes
            high-confidence findings into the provisional layer.
          </p>
        </div>

        <nav className="nav">
          {views.map((view) => (
            <button
              key={view.key}
              className={view.key === activeView ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView(view.key)}
              type="button"
            >
              <strong>{view.label}</strong>
              <span>{view.blurb}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Scaffold Status</span>
            <h2>{views.find((view) => view.key === activeView)?.label}</h2>
          </div>
          <div className="pill-row">
            <span className="pill">Provider: {providerSettings.provider}</span>
            <span className="pill">Mode default: {providerSettings.modeDefault}</span>
            <span className="pill">
              Auto-accept: {providerSettings.autoAcceptThreshold.toFixed(2)}
            </span>
          </div>
        </header>

        {activeView === "intake" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Investigation Intake</h3>
              <p>
                Seed this case with names, aliases, emails, social links, timeline
                notes, and narrative fragments. The scaffold keeps these as raw signals
                before any canonical claim is created.
              </p>
              <div className="signal-grid">
                <label>
                  Target name
                  <input placeholder="Jane Example" />
                </label>
                <label>
                  Known identifier
                  <input placeholder="email, username, phone, URL" />
                </label>
                <label className="full-width">
                  Context notes
                  <textarea
                    rows={5}
                    placeholder="Worked at Acme Labs, graduated from State University, likely wrote about biotech investing."
                  />
                </label>
              </div>
            </article>

            <article className="panel">
              <h3>Scope Checklist</h3>
              <ul className="checklist">
                {Object.entries(DEFAULT_SCOPE_CHECKLIST).map(([key, value]) => (
                  <li key={key}>
                    <span>{formatLabel(key)}</span>
                    <PriorityBadge state={value} />
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}

        {activeView === "planning" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Grouped Task Plan</h3>
              <div className="timeline">
                {planSteps.map((step, index) => (
                  <div key={step.title} className="timeline-item">
                    <span className="step-index">{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <h3>Planner Notes</h3>
              <ul className="detail-list">
                <li>Required checklist items are scheduled first.</li>
                <li>Identity collisions should pause Agent Mode.</li>
                <li>Low-risk enrichment tasks can loop automatically.</li>
              </ul>
            </article>
          </section>
        )}

        {activeView === "runs" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Run Monitor</h3>
              <ul className="detail-list">
                {toolRuns.map((run) => (
                  <li key={run.name}>
                    <strong>{run.name}</strong>
                    <span className="mono">{run.status}</span>
                    <p>{run.summary}</p>
                  </li>
                ))}
              </ul>
            </article>
            <article className="panel">
              <h3>Loop Controls</h3>
              <ul className="detail-list">
                <li>Max passes: 4</li>
                <li>Max recursion depth: 2</li>
                <li>Pause on contradiction: yes</li>
                <li>Manual identity merge required: yes</li>
              </ul>
            </article>
          </section>
        )}

        {activeView === "review" && (
          <section className="grid">
            {reviewItems.map((item) => (
              <article key={item.claim} className="panel">
                <h3>{item.claim}</h3>
                <p>{item.evidence}</p>
                <div className="pill-row">
                  <span className="pill">{item.status}</span>
                  <span className="pill">{item.confidence.toFixed(2)}</span>
                </div>
                <div className="button-row">
                  <button className="tab active" type="button">
                    Approve
                  </button>
                  <button className="tab" type="button">
                    Reject
                  </button>
                  <button className="tab" type="button">
                    Defer
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {activeView === "dossier" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Dossier Workspace</h3>
              <p>
                Canonical and provisional findings will converge here once the review
                queue and graph projection are wired into persistence.
              </p>
              <div className="card-grid">
                {dossierBlocks.map((block) => (
                  <div key={block} className="mini-card">
                    <strong>{block}</strong>
                    <p>Placeholder data block for the first vertical slice.</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <h3>Status</h3>
              <p>Canonical claims: 0</p>
              <p>Provisional claims: 2</p>
              <p>Pending claims: 4</p>
            </article>
          </section>
        )}

        {activeView === "graph" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Graph Placeholder</h3>
              <div className="graph-placeholder">
                {graphNodes.map((node) => (
                  <div key={node} className="graph-node">
                    {node}
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <h3>Projection Notes</h3>
              <ul className="detail-list">
                <li>Postgres remains the canonical store.</li>
                <li>Memgraph receives reviewed or provisional projections.</li>
                <li>Graph labels should preserve claim status and provenance.</li>
              </ul>
            </article>
          </section>
        )}

        {activeView === "settings" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Provider Settings</h3>
              <div className="signal-grid">
                <label>
                  Provider
                  <select
                    value={providerSettings.provider}
                    onChange={(event) =>
                      setProviderSettings((current) => ({
                        ...current,
                        provider: event.target.value as ProviderSettings["provider"]
                      }))
                    }
                  >
                    {PROVIDERS.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  API key
                  <input
                    placeholder="Only required for hosted providers"
                    value={providerSettings.apiKey ?? ""}
                    onChange={(event) =>
                      setProviderSettings((current) => ({
                        ...current,
                        apiKey: event.target.value
                      }))
                    }
                  />
                </label>
                <label>
                  Ollama base URL
                  <input
                    value={providerSettings.baseUrl ?? ""}
                    onChange={(event) =>
                      setProviderSettings((current) => ({
                        ...current,
                        baseUrl: event.target.value
                      }))
                    }
                  />
                </label>
                <label>
                  Model
                  <input
                    value={providerSettings.model ?? ""}
                    onChange={(event) =>
                      setProviderSettings((current) => ({
                        ...current,
                        model: event.target.value
                      }))
                    }
                  />
                </label>
                <label>
                  Default mode
                  <select
                    value={providerSettings.modeDefault}
                    onChange={(event) =>
                      setProviderSettings((current) => ({
                        ...current,
                        modeDefault: event.target.value as CaseMode
                      }))
                    }
                  >
                    {CASE_MODES.map((caseMode) => (
                      <option key={caseMode} value={caseMode}>
                        {caseMode}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Auto-accept threshold
                  <input
                    max="1"
                    min="0"
                    step="0.01"
                    type="number"
                    value={providerSettings.autoAcceptThreshold}
                    onChange={(event) =>
                      setProviderSettings((current) => ({
                        ...current,
                        autoAcceptThreshold: Number(event.target.value)
                      }))
                    }
                  />
                </label>
              </div>
            </article>
            <article className="panel">
              <h3>Contract Notes</h3>
              <ul className="detail-list">
                <li>Provider type is separate from API key and base URL fields.</li>
                <li>Hosted providers use API keys; Ollama uses a local URL and model.</li>
                <li>Mode defaults and thresholds are case-scoped planner inputs.</li>
              </ul>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}

function PriorityBadge({ state }: { state: PriorityState }) {
  return <span className={`priority priority-${state}`}>{state}</span>;
}

function formatLabel(input: string) {
  return input.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

export default App;
