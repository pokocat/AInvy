"""投小AI backend — FastAPI app entry.

Mounts all routers under ``/api`` and turns a live-source failure into a 502
with a clear payload, so the frontend can show a real error instead of fake
data (the prod "no fallback" contract).
"""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .adapters.errors import SourceError
from .config import get_settings
from .routers import analyze, brief, content, funds, tracking
from .schemas import HealthInfo

settings = get_settings()

app = FastAPI(
    title="投小AI API",
    version="2.0.0",
    description="投顾小助手后端：简报 / 优选 / 持仓 / 消息 / 投喂分析。dev=mock，prod=真实数据源（无兜底）。",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https?://localhost(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SourceError)
async def source_error_handler(_request: Request, exc: SourceError) -> JSONResponse:
    """Live data source failed — surface it (no silent fallback in prod)."""
    return JSONResponse(
        status_code=502,
        content={"error": "source_unavailable", "source": exc.source, "detail": exc.detail},
    )


@app.get("/api/health", response_model=HealthInfo, tags=["meta"])
def health() -> HealthInfo:
    return HealthInfo(status="ok", env=settings.app_env)


for r in (brief.router, funds.router, tracking.router, analyze.router, content.router):
    app.include_router(r, prefix="/api")
