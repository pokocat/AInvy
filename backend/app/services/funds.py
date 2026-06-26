"""Funds service — curated fund universe enriched with live prices in prod.

Editorial metadata (name, theme, risk, reason, star, scale, mgr) lives in the
repo regardless of env — it's our analysis, not market data. Only the *prices*
(nav, navChg, series) come from live sources in prod:

* nav / navChg  ← 天天基金 fundgz (盘中估算净值 + 估算涨跌)
* series        ← AKShare 单位净值走势

In dev everything is served from the mock layer. In prod a source failure
raises ``SourceError`` (surfaced as 502) — no fallback.
"""
from __future__ import annotations

import copy

from ..config import get_settings
from ..data import mock


def list_funds() -> list[dict]:
    if get_settings().is_dev:
        return copy.deepcopy(mock.FUNDS)
    return [_enrich(copy.deepcopy(f)) for f in mock.FUNDS]


def get_fund(fund_id: str) -> dict | None:
    base = mock.funds_by_id().get(fund_id)
    if not base:
        return None
    fund = copy.deepcopy(base)
    return fund if get_settings().is_dev else _enrich(fund)


def get_fund_by_code(code: str) -> dict | None:
    base = mock.funds_by_code().get(code)
    if not base:
        return None
    fund = copy.deepcopy(base)
    return fund if get_settings().is_dev else _enrich(fund)


def funds_page() -> dict:
    return {
        "themes": mock.FUND_THEMES,
        "funds": list_funds(),
        "portfolios": copy.deepcopy(mock.PORTFOLIOS),
    }


def _enrich(fund: dict) -> dict:
    """Overlay live prices onto a curated fund (prod only)."""
    from ..adapters import akshare_src, fundgz  # lazy: dev never imports

    est = fundgz.estimate_fields(fund["code"])
    fund["nav"] = est["nav"]
    fund["navChg"] = est["navChg"]
    fund["series"] = akshare_src.fetch_fund_series(fund["code"], n=36)
    return fund
