"""天天基金 fundgz adapter — real-time estimated net value.

Endpoint: ``https://fundgz.1234567.com.cn/js/{code}.js`` which returns a JSONP
payload ``jsonpgz({...});`` containing:

    fundcode, name, jzrq (last confirmed nav date), dwjz (unit nav, confirmed),
    gsz (estimated nav, intraday), gszzl (estimated change %), gztime.

Free, no auth. We only parse — on any failure we raise ``SourceError`` (no
fallback in prod).
"""
from __future__ import annotations

import json
import re

import httpx

from ..config import get_settings
from .errors import SourceError

_JSONP = re.compile(r"jsonpgz\((.*)\);?", re.S)


def fetch_estimate(code: str) -> dict:
    """Return the parsed fundgz estimate for a fund ``code``.

    Keys (raw upstream): fundcode, name, jzrq, dwjz, gsz, gszzl, gztime.
    """
    settings = get_settings()
    url = f"{settings.fundgz_base}/{code}.js"
    try:
        resp = httpx.get(
            url,
            timeout=settings.http_timeout,
            headers={
                "Referer": "https://fund.eastmoney.com/",
                "User-Agent": "Mozilla/5.0 (compatible; touxiaoai/1.0)",
            },
        )
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise SourceError("fundgz", f"请求失败 {code}: {exc}") from exc

    match = _JSONP.search(resp.text)
    if not match:
        raise SourceError("fundgz", f"无法解析返回内容 {code}: {resp.text[:120]!r}")
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        raise SourceError("fundgz", f"JSON 解析失败 {code}: {exc}") from exc


def estimate_fields(code: str) -> dict:
    """Normalise the raw estimate into the fields the Fund schema needs.

    Returns ``{nav, navChg, unit_nav, nav_date}`` where ``nav`` is the intraday
    estimate (盘中估算净值) and ``unit_nav`` the last confirmed value.
    """
    raw = fetch_estimate(code)
    try:
        return {
            "nav": float(raw["gsz"]),
            "navChg": float(raw["gszzl"]),
            "unit_nav": float(raw["dwjz"]),
            "nav_date": raw.get("jzrq", ""),
            "name": raw.get("name", ""),
        }
    except (KeyError, ValueError) as exc:
        raise SourceError("fundgz", f"字段缺失/格式错误 {code}: {exc}") from exc
