"""投喂分析 endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from ..schemas import AnalyzeReq, AnalyzeResult, AnalyzeSamples
from ..services import analyze as analyze_service

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResult)
def analyze(req: AnalyzeReq) -> AnalyzeResult:
    return AnalyzeResult(**analyze_service.analyze(req.text))


@router.get("/analyze/samples", response_model=AnalyzeSamples)
def samples() -> AnalyzeSamples:
    return AnalyzeSamples(**analyze_service.samples())
