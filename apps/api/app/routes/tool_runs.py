from fastapi import APIRouter, HTTPException

from ..models import ToolRunRecord
from ..store import store

router = APIRouter(prefix="/cases", tags=["tool_runs"])


@router.get("/{case_id}/tool-runs", response_model=list[ToolRunRecord])
def list_tool_runs(case_id: str) -> list[ToolRunRecord]:
    if case_id not in store.cases:
        raise HTTPException(status_code=404, detail="Case not found")
    return store.tool_runs.get(case_id, [])
