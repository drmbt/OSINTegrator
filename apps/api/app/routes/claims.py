from fastapi import APIRouter, HTTPException

from ..models import ClaimRecord
from ..store import store

router = APIRouter(prefix="/cases", tags=["claims"])


@router.get("/{case_id}/claims", response_model=list[ClaimRecord])
def list_claims(case_id: str) -> list[ClaimRecord]:
    if case_id not in store.cases:
        raise HTTPException(status_code=404, detail="Case not found")
    return store.get_claims(case_id)
