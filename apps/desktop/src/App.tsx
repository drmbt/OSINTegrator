import React from "react";

import {
  CASE_MODES,
  CLAIM_STATUSES,
  DEFAULT_SCOPE_CHECKLIST,
  PROVIDERS,
  type CaseMode,
  type CaseRecord,
  type ClaimRecord,
  type EvidenceRecord,
  type PriorityState,
  type ProviderSettings,
  type ScopeChecklist,
  type ToolRunRecord
} from "@osintegrator/shared";

import {
  createCase,
  createPlan,
  fetchClaims,
  fetchEvidence,
  fetchHealth,
  fetchSettings,
  fetchToolRuns,
  updateCaseSettings,
  submitIntake,
  type HealthResponse,
  type PlanResponse
} from "./api";

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
    blurb: "Inspect the scaffold claims and their supporting evidence."
  },
  {
    key: "dossier",
    label: "Dossier Workspace",
    blurb: "See the current investigation summary for the seeded target."
  },
  {
    key: "graph",
    label: "Graph View",
    blurb: "Inspect placeholder nodes derived from the current case data."
  },
  {
    key: "settings",
    label: "Settings",
    blurb: "Configure provider selection, model settings, and thresholds."
  }
];

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
  const [scopeChecklist, setScopeChecklist] = React.useState<ScopeChecklist>({
    ...DEFAULT_SCOPE_CHECKLIST
  });
  const [targetName, setTargetName] = React.useState("");
  const [knownIdentifier, setKnownIdentifier] = React.useState("");
  const [contextNotes, setContextNotes] = React.useState("");
  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = React.useState<string | null>(null);
  const [caseRecord, setCaseRecord] = React.useState<CaseRecord | null>(null);
  const [plan, setPlan] = React.useState<PlanResponse | null>(null);
  const [claims, setClaims] = React.useState<ClaimRecord[]>([]);
  const [evidence, setEvidence] = React.useState<EvidenceRecord[]>([]);
  const [toolRuns, setToolRuns] = React.useState<ToolRunRecord[]>([]);
  const [statusMessage, setStatusMessage] = React.useState(
    "Seed a name to create a live scaffold case."
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      try {
        const response = await fetchHealth();
        setHealth(response);
      } catch (error) {
        setHealthError(toErrorMessage(error));
      }
    })();
  }, []);

  React.useEffect(() => {
    setProviderSettings((current) => ({
      ...current,
      modeDefault: mode
    }));
  }, [mode]);

  const evidenceByClaim = React.useMemo(() => {
    const grouped = new Map<string, EvidenceRecord[]>();

    for (const item of evidence) {
      const existing = grouped.get(item.claimId) ?? [];
      existing.push(item);
      grouped.set(item.claimId, existing);
    }

    return grouped;
  }, [evidence]);

  const dossierCards = React.useMemo(() => {
    if (!caseRecord) {
      return [];
    }

    const statuses = CLAIM_STATUSES.map((status) => ({
      label: formatLabel(status),
      count: claims.filter((claim) => claim.status === status).length
    }));

    return [
      {
        title: "Identity summary",
        body: `${caseRecord.name} is the active scaffold target in ${caseRecord.mode} mode.`
      },
      {
        title: "Current signals",
        body: [knownIdentifier, contextNotes].filter(Boolean).join(" | ") || "No extra signals yet."
      },
      {
        title: "Claim distribution",
        body: statuses.map((item) => `${item.label}: ${item.count}`).join(" | ")
      },
      {
        title: "Planner readiness",
        body: plan
          ? `${plan.tasks.length} planned tasks are ready for the next scaffold pass.`
          : "No plan has been generated yet."
      }
    ];
  }, [caseRecord, claims, contextNotes, knownIdentifier, plan]);

  const graphNodes = React.useMemo(() => {
    if (!caseRecord) {
      return [];
    }

    const claimNodes = claims.slice(0, 5).map((claim) => ({
      id: claim.id,
      label: formatLabel(claim.predicate)
    }));

    return [{ id: caseRecord.id, label: caseRecord.name }, ...claimNodes];
  }, [caseRecord, claims]);

  async function handleSeedCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!targetName.trim()) {
      setErrorMessage("Enter at least one real name to create a scaffold case.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage("Creating case, saving intake, and generating a live scaffold plan...");

    try {
      const createdCase = await createCase({
        name: targetName.trim(),
        description: contextNotes.trim(),
        mode,
        autoAcceptThreshold: providerSettings.autoAcceptThreshold,
        scopeChecklist
      });

      setCaseRecord(createdCase);

      await submitIntake(createdCase.id, {
        rawSignals: [targetName.trim(), knownIdentifier.trim()].filter(Boolean),
        notes: contextNotes.trim(),
        priorities: scopeChecklist
      });

      const savedSettings = await updateCaseSettings(createdCase.id, {
        ...providerSettings,
        modeDefault: mode
      });
      setProviderSettings(savedSettings.settings);

      await refreshCaseData(createdCase.id);
      setStatusMessage(
        `Created ${createdCase.id} for ${createdCase.name} and hydrated the scaffold views from the API.`
      );
      setActiveView("planning");
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      setStatusMessage("The scaffold could not complete the case seed flow.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveSettings() {
    if (!caseRecord) {
      setStatusMessage("Create a case first, then save the settings into that case.");
      return;
    }

    setIsSavingSettings(true);
    setErrorMessage(null);

    try {
      const response = await updateCaseSettings(caseRecord.id, {
        ...providerSettings,
        modeDefault: mode
      });
      setProviderSettings(response.settings);
      setStatusMessage(`Saved provider settings into ${caseRecord.id}.`);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function refreshCaseData(caseId: string) {
    const [nextPlan, nextClaims, nextEvidence, nextToolRuns, nextSettings] =
      await Promise.all([
        createPlan(caseId),
        fetchClaims(caseId),
        fetchEvidence(caseId),
        fetchToolRuns(caseId),
        fetchSettings(caseId)
      ]);

    setPlan(nextPlan);
    setClaims(nextClaims);
    setEvidence(nextEvidence);
    setToolRuns(nextToolRuns);
    setProviderSettings(nextSettings.settings);
  }

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
                onClick={() => setMode(caseMode)}
                type="button"
              >
                {caseMode}
              </button>
            ))}
          </div>
          <p className="small">
            Review Mode keeps findings pending. Agent Mode allows provisional
            promotion in the scaffold responses.
          </p>
        </div>

        <div className="mode-card">
          <span className="eyebrow">Connection</span>
          <div className="pill-row">
            <span className="pill">
              API: {health ? health.status : healthError ? "offline" : "checking"}
            </span>
            <span className="pill">Case: {caseRecord?.id ?? "none"}</span>
          </div>
          {healthError ? <p className="small error-text">{healthError}</p> : null}
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
            <span className="eyebrow">Live Scaffold</span>
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

        <section className="status-strip">
          <div className="panel status-panel">
            <strong>Status</strong>
            <p>{statusMessage}</p>
            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          </div>
        </section>

        {activeView === "intake" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Investigation Intake</h3>
              <p>
                Enter a real target name and any known identifier. Submitting this form
                creates a scaffold case, stores the intake, generates a plan, and fills
                the other views from the live API.
              </p>
              <form className="signal-grid" onSubmit={handleSeedCase}>
                <label>
                  Target name
                  <input
                    placeholder="Jane Example"
                    value={targetName}
                    onChange={(event) => setTargetName(event.target.value)}
                  />
                </label>
                <label>
                  Known identifier
                  <input
                    placeholder="email, username, phone, URL"
                    value={knownIdentifier}
                    onChange={(event) => setKnownIdentifier(event.target.value)}
                  />
                </label>
                <label className="full-width">
                  Context notes
                  <textarea
                    rows={5}
                    placeholder="Worked at Acme Labs, graduated from State University, likely wrote about biotech investing."
                    value={contextNotes}
                    onChange={(event) => setContextNotes(event.target.value)}
                  />
                </label>
                <div className="full-width button-row">
                  <button className="tab active" disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Seeding Case..." : "Create Live Test Case"}
                  </button>
                  {caseRecord ? (
                    <button
                      className="tab"
                      onClick={() => void refreshCaseData(caseRecord.id)}
                      type="button"
                    >
                      Refresh From API
                    </button>
                  ) : null}
                </div>
              </form>
            </article>

            <article className="panel">
              <h3>Scope Checklist</h3>
              <ul className="checklist checklist-editable">
                {Object.entries(scopeChecklist).map(([key, value]) => (
                  <li key={key}>
                    <span>{formatLabel(key)}</span>
                    <select
                      value={value}
                      onChange={(event) =>
                        setScopeChecklist((current) => ({
                          ...current,
                          [key]: event.target.value as PriorityState
                        }))
                      }
                    >
                      <option value="required">required</option>
                      <option value="preferred">preferred</option>
                      <option value="ignore">ignore</option>
                      <option value="unknown">unknown</option>
                    </select>
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
              {plan ? (
                <div className="timeline">
                  {plan.tasks.map((task, index) => (
                    <div key={task.name} className="timeline-item">
                      <span className="step-index">{index + 1}</span>
                      <div>
                        <strong>{formatLabel(task.name)}</strong>
                        <p>
                          Tool: <span className="mono">{task.tool}</span> | Inputs:{" "}
                          {task.inputs.join(", ")}
                        </p>
                        <p>
                          Priority: {task.priority.toFixed(2)} | Auto-runnable:{" "}
                          {task.autoRunnable ? "yes" : "no"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Create a case from the intake wizard to generate the first plan." />
              )}
            </article>
            <article className="panel">
              <h3>Planner Notes</h3>
              <ul className="detail-list">
                <li>
                  Required checklist items are prioritized first and affect task ordering.
                </li>
                <li>
                  Agent Mode makes enrichment tasks auto-runnable when the scaffold marks
                  them as low-risk.
                </li>
                <li>
                  This is the next slice to extend with real adapters after the live test
                  case flow feels good.
                </li>
              </ul>
            </article>
          </section>
        )}

        {activeView === "runs" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Run Monitor</h3>
              {toolRuns.length > 0 ? (
                <ul className="detail-list">
                  {toolRuns.map((run) => (
                    <li key={run.id}>
                      <strong>{run.toolName}</strong>
                      <span className="mono">{run.status}</span>
                      <p>{run.summary}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState text="No tool runs yet. Submit intake to populate the run monitor." />
              )}
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
            {claims.length > 0 ? (
              claims.map((item) => (
                <article key={item.id} className="panel">
                  <h3>
                    {item.subject} · {formatLabel(item.predicate)}
                  </h3>
                  <p>{item.value}</p>
                  <div className="pill-row">
                    <span className="pill">{item.status}</span>
                    <span className="pill">{item.confidence.toFixed(2)}</span>
                  </div>
                  <div className="evidence-list">
                    {(evidenceByClaim.get(item.id) ?? []).map((evidenceItem) => (
                      <div key={evidenceItem.id} className="mini-card evidence-card">
                        <strong>{evidenceItem.sourceType}</strong>
                        <p>{evidenceItem.summary}</p>
                        <span className="mono">{evidenceItem.sourceRef}</span>
                      </div>
                    ))}
                  </div>
                  <div className="button-row">
                    <button className="tab" disabled type="button">
                      Approve
                    </button>
                    <button className="tab" disabled type="button">
                      Reject
                    </button>
                    <button className="tab" disabled type="button">
                      Defer
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <article className="panel span-two">
                <EmptyState text="The review queue will populate after you seed a live case." />
              </article>
            )}
          </section>
        )}

        {activeView === "dossier" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Dossier Workspace</h3>
              <p>
                This view now reflects the active case, its current scaffold claims, and
                the latest generated plan from the API.
              </p>
              <div className="card-grid">
                {dossierCards.length > 0 ? (
                  dossierCards.map((block) => (
                    <div key={block.title} className="mini-card">
                      <strong>{block.title}</strong>
                      <p>{block.body}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No dossier yet. Seed a case from the intake tab." />
                )}
              </div>
            </article>
            <article className="panel">
              <h3>Status</h3>
              <p>Approved claims: {claims.filter((claim) => claim.status === "approved").length}</p>
              <p>
                Provisional claims:{" "}
                {claims.filter((claim) => claim.status === "provisional").length}
              </p>
              <p>Pending claims: {claims.filter((claim) => claim.status === "pending").length}</p>
            </article>
          </section>
        )}

        {activeView === "graph" && (
          <section className="grid">
            <article className="panel span-two">
              <h3>Graph Placeholder</h3>
              {graphNodes.length > 0 ? (
                <div className="graph-placeholder">
                  {graphNodes.map((node) => (
                    <div key={node.id} className="graph-node">
                      {node.label}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Graph nodes will appear after the first case is created." />
              )}
            </article>
            <article className="panel">
              <h3>Projection Notes</h3>
              <ul className="detail-list">
                <li>Postgres remains the intended canonical store.</li>
                <li>Memgraph remains the future graph projection target.</li>
                <li>This scaffold graph now derives from the live case and claim bundle.</li>
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
                <div className="full-width button-row">
                  <button
                    className="tab active"
                    disabled={!caseRecord || isSavingSettings}
                    onClick={() => void handleSaveSettings()}
                    type="button"
                  >
                    {isSavingSettings ? "Saving..." : "Save Settings To Active Case"}
                  </button>
                </div>
              </div>
            </article>
            <article className="panel">
              <h3>Contract Notes</h3>
              <ul className="detail-list">
                <li>Provider type is separate from API key and base URL fields.</li>
                <li>Hosted providers use API keys; Ollama uses a local URL and model.</li>
                <li>Settings now round-trip through the active case API route.</li>
              </ul>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}

function formatLabel(input: string) {
  return input.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to the scaffold API.";
}

export default App;
