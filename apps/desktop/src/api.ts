import type {
  CaseRecord,
  ClaimRecord,
  EvidenceRecord,
  ProviderSettings,
  ScopeChecklist,
  ToolRunRecord
} from "@osintegrator/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";
const HEALTH_URL = API_BASE_URL.replace(/\/api$/, "/healthz");

export interface HealthResponse {
  status: string;
  service: string;
}

export interface PlanTask {
  name: string;
  tool: string;
  inputs: string[];
  priority: number;
  autoRunnable: boolean;
}

export interface PlanResponse {
  caseId: string;
  mode: "review" | "agent";
  tasks: PlanTask[];
}

interface SettingsResponse {
  supportedModes: string[];
  supportedClaimStatuses: string[];
  supportedProviders: string[];
  settings: ProviderSettings;
}

interface CaseCreatePayload {
  name: string;
  description: string;
  mode: "review" | "agent";
  autoAcceptThreshold: number;
  scopeChecklist: ScopeChecklist;
}

interface IntakePayload {
  rawSignals: string[];
  notes: string;
  priorities: ScopeChecklist;
}

export async function fetchHealth() {
  return request<HealthResponse>(HEALTH_URL, { method: "GET" });
}

export async function createCase(payload: CaseCreatePayload) {
  return request<CaseRecord>(`${API_BASE_URL}/cases`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function submitIntake(caseId: string, payload: IntakePayload) {
  return request(`${API_BASE_URL}/cases/${caseId}/intake`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function createPlan(caseId: string) {
  return request<PlanResponse>(`${API_BASE_URL}/cases/${caseId}/plan`, {
    method: "POST"
  });
}

export async function fetchClaims(caseId: string) {
  return request<ClaimRecord[]>(`${API_BASE_URL}/cases/${caseId}/claims`, {
    method: "GET"
  });
}

export async function fetchEvidence(caseId: string) {
  return request<EvidenceRecord[]>(`${API_BASE_URL}/cases/${caseId}/evidence`, {
    method: "GET"
  });
}

export async function fetchToolRuns(caseId: string) {
  return request<ToolRunRecord[]>(`${API_BASE_URL}/cases/${caseId}/tool-runs`, {
    method: "GET"
  });
}

export async function fetchSettings(caseId: string) {
  return request<SettingsResponse>(`${API_BASE_URL}/cases/${caseId}/settings`, {
    method: "GET"
  });
}

export async function updateCaseSettings(caseId: string, settings: ProviderSettings) {
  return request<SettingsResponse>(`${API_BASE_URL}/cases/${caseId}/settings`, {
    method: "POST",
    body: JSON.stringify({ settings })
  });
}

async function request<T>(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}
