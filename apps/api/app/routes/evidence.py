from fastapi import APIRouter, HTTPException

from ..models import EvidenceRecord
from ..store import store

router = APIRouter(prefix="/cases", tags=["evidence"])


@router.get("/{case_id}/evidence", response_model=list[EvidenceRecord])
def list_evidence(case_id: str) -> list[EvidenceRecord]:
    if case_id not in store.cases:
        raise HTTPException(status_code=404, detail="Case not found")
    return store.evidence.get(case_id, [])
