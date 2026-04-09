from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .shared_contracts import CASE_MODES, CLAIM_STATUSES, PROVIDERS

CaseMode = Literal["review", "agent"]
ClaimStatus = Literal["pending", "approved", "rejected", "provisional"]
ProviderType = Literal["openai", "anthropic", "gemini", "ollama"]

PriorityState = Literal["required", "preferred", "ignore", "unknown"]


class ScopeChecklist(BaseModel):
    legalName: PriorityState = "required"
    aliases: PriorityState = "preferred"
    birthYear: PriorityState = "preferred"
    socialAccounts: PriorityState = "required"
    linkedIn: PriorityState = "required"
    education: PriorityState = "preferred"
    employment: PriorityState = "required"
    associates: PriorityState = "unknown"
    publicWriting: PriorityState = "preferred"
    internetFootprint: PriorityState = "preferred"


class ProviderSettings(BaseModel):
    provider: ProviderType = Field(default="openai")
    apiKey: str | None = None
    baseUrl: str | None = "http://127.0.0.1:11434"
    model: str | None = "llama3.2"
    modeDefault: CaseMode = Field(default="review")
    autoAcceptThreshold: float = Field(default=0.82, ge=0, le=1)


class CaseCreateRequest(BaseModel):
    name: str
    description: str = ""
    mode: CaseMode = "review"
    autoAcceptThreshold: float = Field(default=0.82, ge=0, le=1)
    scopeChecklist: ScopeChecklist = Field(default_factory=ScopeChecklist)


class CaseRecord(CaseCreateRequest):
    id: str


class IntakeRequest(BaseModel):
    rawSignals: list[str] = Field(default_factory=list)
    notes: str = ""
    priorities: ScopeChecklist = Field(default_factory=ScopeChecklist)


class PlannerTask(BaseModel):
    name: str
    tool: str
    inputs: list[str]
    priority: float = Field(ge=0, le=1)
    autoRunnable: bool


class PlanResponse(BaseModel):
    caseId: str
    mode: CaseMode
    tasks: list[PlannerTask]


class EvidenceRecord(BaseModel):
    id: str
    claimId: str
    sourceType: Literal["url", "tool", "document", "manual"]
    sourceRef: str
    summary: str


class ClaimRecord(BaseModel):
    id: str
    subject: str
    predicate: str
    value: str
    confidence: float = Field(ge=0, le=1)
    status: ClaimStatus
    evidenceIds: list[str]


class ToolRunRecord(BaseModel):
    id: str
    toolName: str
    taskGroup: str
    status: Literal["queued", "running", "completed", "failed"]
    summary: str


class SettingsUpdateRequest(BaseModel):
    settings: ProviderSettings


class SettingsResponse(BaseModel):
    supportedModes: list[str] = Field(default_factory=lambda: list(CASE_MODES))
    supportedClaimStatuses: list[str] = Field(default_factory=lambda: list(CLAIM_STATUSES))
    supportedProviders: list[str] = Field(default_factory=lambda: list(PROVIDERS))
    settings: ProviderSettings
