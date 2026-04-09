export const CASE_MODES = ["review", "agent"] as const;
export type CaseMode = (typeof CASE_MODES)[number];

export const CLAIM_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "provisional"
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const PROVIDERS = ["openai", "anthropic", "gemini", "ollama"] as const;
export type ProviderType = (typeof PROVIDERS)[number];

export const PRIORITY_STATES = ["required", "preferred", "ignore", "unknown"] as const;
export type PriorityState = (typeof PRIORITY_STATES)[number];

export type ScopeChecklist = Record<string, PriorityState>;

export interface ProviderSettings {
  provider: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  modeDefault: CaseMode;
  autoAcceptThreshold: number;
}

export interface CaseRecord {
  id: string;
  name: string;
  description: string;
  mode: CaseMode;
  autoAcceptThreshold: number;
  scopeChecklist: ScopeChecklist;
}

export interface EvidenceRecord {
  id: string;
  claimId: string;
  sourceType: "url" | "tool" | "document" | "manual";
  sourceRef: string;
  summary: string;
}

export interface ClaimRecord {
  id: string;
  subject: string;
  predicate: string;
  value: string;
  confidence: number;
  status: ClaimStatus;
  evidenceIds: string[];
}

export interface ToolRunRecord {
  id: string;
  toolName: string;
  taskGroup: string;
  status: "queued" | "running" | "completed" | "failed";
  summary: string;
}

export const DEFAULT_SCOPE_CHECKLIST: ScopeChecklist = {
  legalName: "required",
  aliases: "preferred",
  birthYear: "preferred",
  socialAccounts: "required",
  linkedIn: "required",
  education: "preferred",
  employment: "required",
  associates: "unknown",
  publicWriting: "preferred",
  internetFootprint: "preferred"
};
