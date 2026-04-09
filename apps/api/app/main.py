from fastapi import APIRouter, FastAPI

from .routes.cases import router as cases_router
from .routes.claims import router as claims_router
from .routes.evidence import router as evidence_router
from .routes.health import router as health_router
from .routes.settings import router as settings_router
from .routes.tool_runs import router as tool_runs_router

app = FastAPI(
    title="OSINTegrator API",
    version="0.1.0",
    summary="Scaffold backend for a local-first OSINT IDE.",
)

api = APIRouter(prefix="/api")
api.include_router(cases_router)
api.include_router(claims_router)
api.include_router(evidence_router)
api.include_router(settings_router)
api.include_router(tool_runs_router)

app.include_router(health_router)
app.include_router(api)
