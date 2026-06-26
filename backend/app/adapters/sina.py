"""新浪财经 hq.sinajs adapter — millisecond A-share realtime quotes.

Endpoint: ``https://hq.sinajs.cn/list=sh000001,sz399001`` returns lines like::

    var hq_str_sh000001="上证指数,3000.1,2998.0,3010.5,...";

Free; requires a sina Referer header and request-rate restraint. Raises
``SourceError`` on failure (no fallback in prod).
"""
from __future__ import annotations

import re

import httpx

from ..config import get_settings
from .errors import SourceError

_LINE = re.compile(r'var hq_str_(\w+)="([^"]*)";')


def fetch_quotes(symbols: list[str]) -> dict[str, dict]:
    """Return ``{symbol: {name, price, prev_close, open, change_pct}}``."""
    if not symbols:
        return {}
    settings = get_settings()
    url = f"{settings.sina_hq_base}/list={','.join(symbols)}"
    try:
        resp = httpx.get(
            url,
            timeout=settings.http_timeout,
            headers={"Referer": "https://finance.sina.com.cn/"},
        )
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise SourceError("sina", f"行情请求失败: {exc}") from exc

    out: dict[str, dict] = {}
    for sym, payload in _LINE.findall(resp.text):
        parts = payload.split(",")
        if len(parts) < 4:
            continue
        try:
            price = float(parts[3])
            prev_close = float(parts[2])
            change_pct = round((price - prev_close) / prev_close * 100, 2) if prev_close else 0.0
            out[sym] = {
                "name": parts[0],
                "open": float(parts[1]),
                "prev_close": prev_close,
                "price": price,
                "change_pct": change_pct,
            }
        except ValueError as exc:
            raise SourceError("sina", f"行情解析失败 {sym}: {exc}") from exc
    if not out:
        raise SourceError("sina", f"无有效行情返回: {resp.text[:120]!r}")
    return out
