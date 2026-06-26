"""投喂分析 service — turn user-fed text into concepts + matched funds.

dev:  the deterministic rule engine (data/concepts.py).
prod: the LLM extracts concepts/tone/nature/summary/risk; we map its concepts
      back to investable funds via the project's concept table.

Either way the output shape is identical, and fund matches carry a relevance
score (92 / 75 / 58 … descending, matching the prototype).
"""
from __future__ import annotations

from ..config import get_settings
from ..data import concepts as concept_engine
from ..data import mock
from . import funds as funds_service

_RELEVANCE = [92, 75, 58, 45, 38]


def analyze(text: str) -> dict:
    if get_settings().is_dev:
        parsed = concept_engine.analyze_text(text)
        engine = "rule"
        concept_hits = parsed["concepts"]
        fund_ids = parsed["fund_ids"]
        summary, tone, nature, risk = (
            parsed["summary"], parsed["tone"], parsed["nature"], parsed["risk"],
        )
    else:
        from ..adapters import llm  # lazy: dev never imports

        parsed = llm.analyze(text)
        engine = "llm"
        concept_names = parsed["concepts"]
        concept_hits = [{"concept": c, "score": 0} for c in concept_names]
        fund_ids = concept_engine.concept_funds(concept_names)
        summary, tone, nature, risk = (
            parsed["summary"], parsed["tone"], parsed["nature"], parsed["risk"],
        )

    matches = []
    for i, fid in enumerate(fund_ids[:3]):
        fund = funds_service.get_fund(fid)
        if fund:
            matches.append({"fund": fund, "relevance": _RELEVANCE[min(i, len(_RELEVANCE) - 1)]})

    return {
        "summary": summary,
        "tone": tone,
        "nature": nature,
        "concepts": concept_hits,
        "matches": matches,
        "risk": risk,
        "engine": engine,
    }


def samples() -> dict:
    return {"samples": mock.ANALYZE_SAMPLES, "history": mock.ANALYZE_HISTORY}
