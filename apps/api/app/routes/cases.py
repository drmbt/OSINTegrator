from fastapi import APIRouter, HTTPException

from ..models import CaseCreateRequest, CaseRecord, IntakeRequest, PlanResponse
from ..store import store

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post("", response_model=CaseRecord)
def create_case(payload: CaseCreateRequest) -> CaseRecord:
    return store.create_case(payload)


@router.get("/{case_id}", response_model=CaseRecord)
def get_case(case_id: str) -> CaseRecord:
    try:
        return store.get_case(case_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Case not found") from exc


@router.post("/{case_id}/intake", response_model=IntakeRequest)
def save_intake(case_id: str, payload: IntakeRequest) -> IntakeRequest:
    if case_id not in store.cases:
        raise HTTPException(status_code=404, detail="Case not found")
    return store.save_intake(case_id, payload)


@router.post("/{case_id}/plan", response_model=PlanResponse)
def create_plan(case_id: str) -> PlanResponse:
    if case_id not in store.cases:
        raise HTTPException(status_code=404, detail="Case not found")
    return store.build_plan(case_id)
