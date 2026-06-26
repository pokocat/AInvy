"""大模型 (LLM) adapter for 投喂分析 — DeepSeek / 通义 / Kimi via OpenAI-compatible API.

In prod the analyze service asks the LLM to extract concepts, judge sentiment
and nature, and write a summary + risk notes. We constrain it to the project's
fixed concept vocabulary so its output maps cleanly back to investable funds.

Requires ``LLM_API_KEY``. Any failure raises ``SourceError`` — no fallback.
"""
from __future__ import annotations

import json

import httpx

from ..config import get_settings
from ..data.concepts import CONCEPT_MAP
from .errors import SourceError

_CONCEPT_NAMES = [c["concept"] for c in CONCEPT_MAP]

_SYSTEM = (
    "你是一名严谨的投顾分析助手。用户会投喂一段市场消息/新闻/传闻，"
    "你需要输出严格的 JSON（不要markdown、不要多余文字），字段如下：\n"
    "{\n"
    '  "concepts": [从给定概念表中选 1-3 个最相关概念的中文名],\n'
    '  "tone": "利好" | "利空" | "中性",\n'
    '  "nature": "官方·数据" | "传闻·观点" | "市场观点",\n'
    '  "summary": "一句话中文摘要",\n'
    '  "risk": [1-3 条中文风险提示]\n'
    "}\n"
    f"概念表（concepts 只能从中选取）：{ '、'.join(_CONCEPT_NAMES) }。\n"
    "若信息无明确主题，concepts 返回 [\"宽基指数\"]。"
)


def analyze(text: str) -> dict:
    """Call the LLM and return a dict with keys: concepts, tone, nature, summary, risk."""
    settings = get_settings()
    if not settings.llm_api_key:
        raise SourceError("llm", "未配置 LLM_API_KEY")

    payload = {
        "model": settings.llm_model,
        "messages": [
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": text},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "stream": False,
    }
    try:
        resp = httpx.post(
            f"{settings.llm_base}/chat/completions",
            json=payload,
            timeout=settings.http_timeout * 4,  # generation is slower than a quote
            headers={"Authorization": f"Bearer {settings.llm_api_key}"},
        )
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise SourceError("llm", f"请求失败: {exc}") from exc

    try:
        content = resp.json()["choices"][0]["message"]["content"]
        data = json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise SourceError("llm", f"返回解析失败: {exc}") from exc

    concepts = [c for c in data.get("concepts", []) if c in _CONCEPT_NAMES]
    if not concepts:
        concepts = ["宽基指数"]
    tone = data.get("tone") if data.get("tone") in ("利好", "利空", "中性") else "中性"
    nature = data.get("nature") if data.get("nature") in ("官方·数据", "传闻·观点", "市场观点") else "市场观点"
    risk = [str(r) for r in data.get("risk", [])][:3]
    risk.append("以上为 AI 对公开信息的梳理与匹配，不构成投资建议；最终决策请结合自身风险承受能力。")

    return {
        "concepts": concepts,
        "tone": tone,
        "nature": nature,
        "summary": str(data.get("summary", "")),
        "risk": risk,
    }
