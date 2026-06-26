"""AKShare adapter — full-market data (sectors, fund net-value history, news).

AKShare is a Python-only open-source library that wraps dozens of free finance
endpoints. We import it lazily so ``dev`` never needs it installed. Every call
raises ``SourceError`` on failure — no fallback in prod.

Note: AKShare's upstream sources occasionally rename columns. We defensively
look the values up and raise a clear ``SourceError`` if the shape changed,
rather than guessing.
"""
from __future__ import annotations

from typing import Any

from .errors import SourceError


def _ak() -> Any:
    try:
        import akshare as ak  # noqa: PLC0415 — lazy: dev doesn't need it
    except ImportError as exc:  # pragma: no cover - env dependent
        raise SourceError("akshare", "未安装 akshare，请在生产环境 pip install akshare") from exc
    return ak


def fetch_sectors(limit: int = 7) -> list[dict]:
    """Industry board heat board → list of {name, chg, ...}.

    Uses ``stock_board_industry_name_em`` (东方财富 行业板块). Heat is derived
    from the change rank since AKShare doesn't expose a raw "heat" score.
    """
    ak = _ak()
    try:
        df = ak.stock_board_industry_name_em()
    except Exception as exc:  # noqa: BLE001 - upstream raises arbitrary types
        raise SourceError("akshare", f"行业板块拉取失败: {exc}") from exc

    chg_col = _pick(df, ["涨跌幅"])
    name_col = _pick(df, ["板块名称", "名称"])
    df = df.sort_values(chg_col, ascending=False).head(limit)
    out: list[dict] = []
    total = len(df)
    for rank, (_, row) in enumerate(df.iterrows()):
        chg = float(row[chg_col])
        out.append({
            "name": str(row[name_col]),
            "heat": max(40, 98 - rank * 7),  # rank-derived heat, descending
            "chg": round(chg, 2),
            "tags": [],
            "note": "",
        })
    if not out:
        raise SourceError("akshare", "行业板块返回为空")
    return out


def fetch_fund_series(code: str, n: int = 36) -> list[float]:
    """Unit net-value history for a fund → list of floats (oldest→newest)."""
    ak = _ak()
    try:
        df = ak.fund_open_fund_info_em(symbol=code, indicator="单位净值走势")
    except Exception as exc:  # noqa: BLE001
        raise SourceError("akshare", f"基金净值走势拉取失败 {code}: {exc}") from exc

    nav_col = _pick(df, ["单位净值", "净值"])
    series = [float(v) for v in df[nav_col].tail(n).tolist()]
    if not series:
        raise SourceError("akshare", f"基金净值走势为空 {code}")
    return series


def fetch_news(limit: int = 5) -> list[dict]:
    """Finance news feed → list of {title, summary, time, source}.

    Uses the 财经内容精选 (``stock_info_global_em``) endpoint.
    """
    ak = _ak()
    try:
        df = ak.stock_info_global_em()
    except Exception as exc:  # noqa: BLE001
        raise SourceError("akshare", f"财经新闻拉取失败: {exc}") from exc

    title_col = _pick(df, ["标题"])
    time_col = _pick(df, ["发布时间", "时间"])
    summary_col = _pick(df, ["摘要", "内容"], required=False)
    out: list[dict] = []
    for _, row in df.head(limit).iterrows():
        out.append({
            "title": str(row[title_col]),
            "summary": str(row[summary_col]) if summary_col else "",
            "time": str(row[time_col]),
            "source": "东方财富",
        })
    if not out:
        raise SourceError("akshare", "财经新闻返回为空")
    return out


def _pick(df: Any, candidates: list[str], required: bool = True) -> str | None:
    """Return the first candidate column present in ``df``."""
    for c in candidates:
        if c in df.columns:
            return c
    if required:
        raise SourceError("akshare", f"返回列结构异常，缺少 {candidates}，实际列: {list(df.columns)}")
    return None
