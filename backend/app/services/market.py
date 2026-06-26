"""Market service — 简报 (daily briefing) assembly.

dev: the full mock briefing (AI summary, points, sectors, feed).
prod: sectors from AKShare 行业板块, feed from AKShare 财经新闻, and the AI
      summary + points written by the LLM from those headlines.

Any live-source failure raises ``SourceError`` — no fallback.
"""
from __future__ import annotations

import copy

from ..config import get_settings
from ..data import mock


def get_brief() -> dict:
    if get_settings().is_dev:
        return _mock_brief()
    return _real_brief()


def _mock_brief() -> dict:
    return {
        "date": mock.BRIEF_DATE,
        "summary": mock.AI_SUMMARY,
        "points": copy.deepcopy(mock.AI_POINTS),
        "sectors": copy.deepcopy(mock.SECTORS),
        "feed": copy.deepcopy(mock.FEED),
        "cats": mock.CATS,
    }


def _real_brief() -> dict:
    from ..adapters import akshare_src  # lazy: dev never imports
    from ..adapters import llm

    sectors = akshare_src.fetch_sectors(limit=7)
    news = akshare_src.fetch_news(limit=5)

    feed: list[dict] = []
    for i, n in enumerate(news):
        feed.append({
            "id": f"f{i+1}",
            "cat": "热点",
            "accent": "up" if i % 2 == 0 else "flat",
            "time": n.get("time", ""),
            "source": n.get("source", "财经新闻"),
            "ai": i < 3,  # only the top headlines carry an AI解读 toggle
            "title": n["title"],
            "summary": n.get("summary", ""),
            "detail": n.get("summary", ""),
        })

    # The LLM distils a one-paragraph summary + bullet points from the day's
    # sector + headline data. Reuses the analyze adapter's structured output.
    headline_blob = "；".join(s["name"] + f"({s['chg']:+.2f}%)" for s in sectors[:5])
    headline_blob += "。新闻：" + "；".join(n["title"] for n in news)
    distilled = llm.analyze(headline_blob)
    points = [
        {"t": s["name"] + f" 板块涨跌 {s['chg']:+.2f}%", "tone": "up" if s["chg"] >= 0 else "down"}
        for s in sectors[:5]
    ]

    return {
        "date": _today_label(),
        "summary": distilled["summary"],
        "points": points,
        "sectors": sectors,
        "feed": feed,
        "cats": mock.CATS,
    }


def _today_label() -> str:
    import datetime

    week = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    now = datetime.datetime.now()
    return f"{now.year}年{now.month}月{now.day}日 · {week[now.weekday()]}"
