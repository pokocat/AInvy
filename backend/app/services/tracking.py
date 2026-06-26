"""Tracking service — watchlist + simulated positions, with live nav overlay.

User state lives in ``store``. Prices layered on top come from the funds
service (live in prod, mock in dev). Positions recompute market value/P&L from
the latest nav so the holdings screen stays consistent with the funds screen.
"""
from __future__ import annotations

from .. import store
from ..data import mock
from . import funds as funds_service


def tracking() -> dict:
    funds_by_id = {f["id"]: f for f in funds_service.list_funds()}

    watch = []
    for fid in store.watch_ids():
        fund = funds_by_id.get(fid)
        if fund:
            watch.append({"id": fid, "name": fund["name"], "code": fund["code"],
                          "nav": fund["nav"], "chg": fund["navChg"]})
        else:
            seed = next((w for w in mock.WATCHLIST if w["id"] == fid), None)
            if seed:
                watch.append(seed)

    positions = []
    for p in store.positions():
        fund = funds_by_id.get(p["id"])
        nav = fund["nav"] if fund else p["nav"]
        positions.append({**p, "nav": nav})

    return {"watch": watch, "positions": positions}


def toggle_watch(fund_id: str) -> bool:
    return store.toggle_watch(fund_id)


def buy(fund_id: str, amount: int, mode: str) -> dict | None:
    fund = funds_service.get_fund(fund_id)
    if not fund:
        return None
    store.buy(fund, amount, mode)
    return tracking()
