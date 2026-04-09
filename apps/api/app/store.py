from __future__ import annotations

import re
from uuid import uuid4

from .models import (
    CaseCreateRequest,
    CaseRecord,
    ClaimRecord,
    EvidenceRecord,
    IntakeRequest,
    PlannerTask,
    PlanResponse,
    ProviderSettings,
    SettingsResponse,
    ToolRunRecord,
)


class InMemoryStore:
    def __init__(self) -> None:
        self.cases: dict[str, CaseRecord] = {}
        self.claims: dict[str, list[ClaimRecord]] = {}
        self.evidence: dict[str, list[EvidenceRecord]] = {}
        self.tool_runs: dict[str, list[ToolRunRecord]] = {}
        self.intake: dict[str, IntakeRequest] = {}
        self.settings: dict[str, ProviderSettings] = {}

    def create_case(self, payload: CaseCreateRequest) -> CaseRecord:
        case = CaseRecord(id=f"case_{uuid4().hex[:8]}", **payload.model_dump())
        self.cases[case.id] = case
        self.claims[case.id] = [
            ClaimRecord(
                id=f"claim_{uuid4().hex[:8]}",
                subject=payload.name,
                predicate="mode",
                value=payload.mode,
                confidence=1.0,
                status="approved",
                evidenceIds=[],
            ),
            ClaimRecord(
                id=f"claim_{uuid4().hex[:8]}",
                subject=payload.name,
                predicate="employment_trace",
                value="Scaffold placeholder pending enrichment",
                confidence=0.52,
                status="pending",
                evidenceIds=[],
            ),
        ]
        self.evidence[case.id] = [
            EvidenceRecord(
                id=f"evidence_{uuid4().hex[:8]}",
                claimId=self.claims[case.id][1].id,
                sourceType="manual",
                sourceRef="intake://placeholder",
                summary="Initial scaffold placeholder evidence generated for the review queue.",
            )
        ]
        self.tool_runs[case.id] = [
            ToolRunRecord(
                id=f"run_{uuid4().hex[:8]}",
                toolName="planner.normalize_intake",
                taskGroup="intake",
                status="completed",
                summary="Created placeholder signals and first-pass planning groups.",
            )
        ]
        self.settings[case.id] = ProviderSettings(
            modeDefault=payload.mode,
            autoAcceptThreshold=payload.autoAcceptThreshold,
        )
        return case

    def get_case(self, case_id: str) -> CaseRecord:
        return self.cases[case_id]

    def save_intake(self, case_id: str, payload: IntakeRequest) -> IntakeRequest:
        self.intake[case_id] = payload
        case = self.cases[case_id]
        display_name = case.name.strip() or "Unknown target"
        slug = slugify(display_name)
        identifier = payload.rawSignals[1] if len(payload.rawSignals) > 1 and payload.rawSignals[1] else ""
        note_summary = payload.notes.strip() or "No narrative notes captured yet."

        mode_claim = self.claims[case_id][0]
        self.claims[case_id] = [
            mode_claim,
            ClaimRecord(
                id=f"claim_{uuid4().hex[:8]}",
                subject=display_name,
                predicate="identity_seed",
                value=f"{display_name} entered as the current investigation target",
                confidence=0.98,
                status="approved",
                evidenceIds=[],
            ),
            ClaimRecord(
                id=f"claim_{uuid4().hex[:8]}",
                subject=display_name,
                predicate="professional_trace",
                value=f"{display_name} may have a professional footprint worth checking across employment and LinkedIn sources",
                confidence=0.58,
                status="provisional" if case.mode == "agent" else "pending",
                evidenceIds=[],
            ),
        ]

        if identifier:
            self.claims[case_id].append(
                ClaimRecord(
                    id=f"claim_{uuid4().hex[:8]}",
                    subject=display_name,
                    predicate="identifier_hint",
                    value=f"{display_name} is associated with the supplied identifier `{identifier}`",
                    confidence=0.72,
                    status="provisional" if case.mode == "agent" else "pending",
                    evidenceIds=[],
                )
            )

        if payload.notes.strip():
            self.claims[case_id].append(
                ClaimRecord(
                    id=f"claim_{uuid4().hex[:8]}",
                    subject=display_name,
                    predicate="narrative_lead",
                    value=payload.notes.strip(),
                    confidence=0.44,
                    status="pending",
                    evidenceIds=[],
                )
            )

        evidence_items = [
            EvidenceRecord(
                id=f"evidence_{uuid4().hex[:8]}",
                claimId=self.claims[case_id][1].id,
                sourceType="manual",
                sourceRef="intake://target-name",
                summary=f"Investigator created a case for {display_name}.",
            ),
            EvidenceRecord(
                id=f"evidence_{uuid4().hex[:8]}",
                claimId=self.claims[case_id][2].id,
                sourceType="tool",
                sourceRef="stub://planner",
                summary=f"Planner identified professional discovery as a likely next pass for {display_name}.",
            ),
        ]

        if identifier and len(self.claims[case_id]) > 3:
            evidence_items.append(
                EvidenceRecord(
                    id=f"evidence_{uuid4().hex[:8]}",
                    claimId=self.claims[case_id][3].id,
                    sourceType="manual",
                    sourceRef="intake://known-identifier",
                    summary=f"Investigator supplied `{identifier}` as a starting identifier.",
                )
            )

        if payload.notes.strip():
            target_claim = self.claims[case_id][-1]
            evidence_items.append(
                EvidenceRecord(
                    id=f"evidence_{uuid4().hex[:8]}",
                    claimId=target_claim.id,
                    sourceType="manual",
                    sourceRef="intake://notes",
                    summary=note_summary,
                )
            )

        for claim in self.claims[case_id]:
            claim.evidenceIds = [item.id for item in evidence_items if item.claimId == claim.id]

        self.evidence[case_id] = evidence_items
        self.tool_runs[case_id] = [
            ToolRunRecord(
                id=f"run_{uuid4().hex[:8]}",
                toolName="planner.normalize_intake",
                taskGroup="intake",
                status="completed",
                summary=f"Normalized name, notes, and scope checklist for {display_name}.",
            ),
            ToolRunRecord(
                id=f"run_{uuid4().hex[:8]}",
                toolName="stub_spiderfoot",
                taskGroup="professional_trace",
                status="queued",
                summary=f"Prepared employer and domain enrichment tasks for {slug}.",
            ),
            ToolRunRecord(
                id=f"run_{uuid4().hex[:8]}",
                toolName="stub_sherlock",
                taskGroup="social_accounts",
                status="queued",
                summary=f"Prepared username and social footprint pivots for {slug}.",
            ),
        ]
        return payload

    def build_plan(self, case_id: str) -> PlanResponse:
        case = self.cases[case_id]
        intake = self.intake.get(case_id)
        priorities = intake.priorities if intake else case.scopeChecklist
        known_inputs = []
        if intake and intake.rawSignals:
            known_inputs = [signal for signal in intake.rawSignals if signal]

        tasks = [
            PlannerTask(
                name="identity_resolution",
                tool="planner",
                inputs=known_inputs or ["name", "aliases", "social profile links"],
                priority=0.95,
                autoRunnable=True,
            ),
        ]

        if priorities.employment in ("required", "preferred") or priorities.linkedIn in (
            "required",
            "preferred",
        ):
            tasks.append(
                PlannerTask(
                    name="professional_trace",
                    tool="stub_spiderfoot",
                    inputs=["employment", "education", "LinkedIn"],
                    priority=0.86 if priorities.linkedIn == "required" else 0.73,
                    autoRunnable=case.mode == "agent",
                )
            )

        if priorities.socialAccounts in ("required", "preferred"):
            tasks.append(
                PlannerTask(
                    name="social_account_search",
                    tool="stub_sherlock",
                    inputs=["social accounts", "usernames", "public profiles"],
                    priority=0.82 if priorities.socialAccounts == "required" else 0.68,
                    autoRunnable=case.mode == "agent",
                )
            )

        if priorities.publicWriting in ("required", "preferred"):
            tasks.append(
                PlannerTask(
                    name="public_writing_search",
                    tool="planner",
                    inputs=["articles", "interviews", "press mentions"],
                    priority=0.78,
                    autoRunnable=False,
                )
            )

        return PlanResponse(caseId=case_id, mode=case.mode, tasks=tasks)

    def get_claims(self, case_id: str) -> list[ClaimRecord]:
        return self.claims.get(case_id, [])

    def update_settings(self, case_id: str, settings: ProviderSettings) -> SettingsResponse:
        self.settings[case_id] = settings
        return SettingsResponse(settings=settings)

    def get_settings(self, case_id: str) -> SettingsResponse:
        return SettingsResponse(settings=self.settings.get(case_id, ProviderSettings()))


store = InMemoryStore()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "target"
