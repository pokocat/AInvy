"""Pydantic models — the API contract shared with the Taro frontend.

Field names mirror the prototype's data.jsx so the frontend port stays a
near-1:1 mapping.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

Tone = Literal["利好", "利空", "中性"]


# --------------------------------------------------------------------------- #
# 简报 (daily briefing)
# --------------------------------------------------------------------------- #
class AiPoint(BaseModel):
    t: str
    tone: Literal["up", "down", "flat"]


class Sector(BaseModel):
    name: str
    heat: int
    chg: float
    tags: list[str]
    note: str


class FeedItem(BaseModel):
    id: str
    cat: str
    accent: Literal["brand", "up", "flat"]
    time: str
    source: str
    ai: bool = False
    title: str
    summary: str
    detail: str = ""


class Brief(BaseModel):
    date: str
    summary: str
    points: list[AiPoint]
    sectors: list[Sector]
    feed: list[FeedItem]
    cats: list[str]


# --------------------------------------------------------------------------- #
# 优选 (funds + portfolios)
# --------------------------------------------------------------------------- #
class Fund(BaseModel):
    id: str
    code: str
    name: str
    theme: str
    type: str
    risk: str
    y1: float
    sip: bool
    star: float
    nav: float
    navChg: float
    scale: str
    mgr: str
    reason: str
    series: list[float]


class PortfolioItem(BaseModel):
    name: str
    w: int


class Portfolio(BaseModel):
    id: str
    name: str
    risk: str
    tag: str
    desc: str
    target: str
    items: list[PortfolioItem]


class FundsPage(BaseModel):
    themes: list[str]
    funds: list[Fund]
    portfolios: list[Portfolio]


# --------------------------------------------------------------------------- #
# 持仓 (tracking: watchlist + simulated positions)
# --------------------------------------------------------------------------- #
class WatchItem(BaseModel):
    id: str
    name: str
    code: str
    nav: float
    chg: float


class Position(BaseModel):
    id: str
    name: str
    code: str
    cost: float
    nav: float
    shares: int
    sip: bool
    sipAmt: int


class Tracking(BaseModel):
    watch: list[WatchItem]
    positions: list[Position]


class WatchToggleReq(BaseModel):
    fund_id: str


class BuyReq(BaseModel):
    fund_id: str
    amount: int = Field(gt=0)
    mode: Literal["定投", "单次"]


# --------------------------------------------------------------------------- #
# 消息 (message centre)
# --------------------------------------------------------------------------- #
class Message(BaseModel):
    id: str
    type: str
    icon: str
    title: str
    desc: str
    time: str
    unread: bool


# --------------------------------------------------------------------------- #
# 投喂分析 (feed analysis)
# --------------------------------------------------------------------------- #
class AnalyzeReq(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class ConceptHit(BaseModel):
    concept: str
    score: int


class MatchedFund(BaseModel):
    fund: Fund
    relevance: int


class AnalyzeResult(BaseModel):
    summary: str
    tone: Tone
    nature: str
    concepts: list[ConceptHit]
    matches: list[MatchedFund]
    risk: list[str]
    engine: Literal["rule", "llm"]


class ClueItem(BaseModel):
    id: str
    date: str
    text: str
    concepts: list[str]
    fundIds: list[str]
    tone: Tone
    since: float


class AnalyzeSamples(BaseModel):
    samples: list[str]
    history: list[ClueItem]


# --------------------------------------------------------------------------- #
# 数据源 (sources sheet)
# --------------------------------------------------------------------------- #
class Source(BaseModel):
    tag: str
    name: str
    desc: str
    free: bool


class HealthInfo(BaseModel):
    status: Literal["ok"]
    env: str
    sources: Optional[dict[str, str]] = None
