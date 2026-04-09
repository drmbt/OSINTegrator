from __future__ import annotations

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
        self.settings[case.id] = ProviderSettings(modeDefault=payload.mode)
        return case

    def get_case(self, case_id: str) -> CaseRecord:
        return self.cases[case_id]

    def save_intake(self, case_id: str, payload: IntakeRequest) -> IntakeRequest:
        self.intake[case_id] = payload
        return payload

    def build_plan(self, case_id: str) -> PlanResponse:
        case = self.cases[case_id]
        tasks = [
            PlannerTask(
                name="identity_resolution",
                tool="planner",
                inputs=["name", "aliases", "social profile links"],
                priority=0.95,
                autoRunnable=True,
            ),
            PlannerTask(
                name="professional_trace",
                tool="stub_spiderfoot",
                inputs=["employment", "education", "LinkedIn"],
                priority=0.86,
                autoRunnable=case.mode == "agent",
            ),
            PlannerTask(
                name="public_writing_search",
                tool="stub_sherlock",
                inputs=["social accounts", "articles", "interviews"],
                priority=0.78,
                autoRunnable=case.mode == "agent",
            ),
        ]
        return PlanResponse(caseId=case_id, mode=case.mode, tasks=tasks)

    def get_claims(self, case_id: str) -> list[ClaimRecord]:
        return self.claims.get(case_id, [])

    def update_settings(self, case_id: str, settings: ProviderSettings) -> SettingsResponse:
        self.settings[case_id] = settings
        return SettingsResponse(settings=settings)

    def get_settings(self, case_id: str) -> SettingsResponse:
        return SettingsResponse(settings=self.settings.get(case_id, ProviderSettings()))


store = InMemoryStore()
