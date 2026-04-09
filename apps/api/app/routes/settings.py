from fastapi import APIRouter, HTTPException

from ..models import SettingsResponse, SettingsUpdateRequest
from ..store import store

router = APIRouter(prefix="/cases", tags=["settings"])


@router.post("/{case_id}/settings", response_model=SettingsResponse)
def update_settings(case_id: str, payload: SettingsUpdateRequest) -> SettingsResponse:
    if case_id not in store.cases:
        raise HTTPException(status_code=404, detail="Case not found")
    return store.update_settings(case_id, payload.settings)


@router.get("/{case_id}/settings", response_model=SettingsResponse)
def get_settings(case_id: str) -> SettingsResponse:
    if case_id not in store.cases:
        raise HTTPException(status_code=404, detail="Case not found")
    return store.get_settings(case_id)
