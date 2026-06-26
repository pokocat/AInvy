"""In-memory user state for watchlist + simulated positions.

This is per-process mutable state (a stand-in for the cloud database in the
chat's architecture). It holds *user* data — not market data — so it behaves
the same in dev and prod; only the nav prices layered on top come from the
live sources in prod.

Single-user demo scope: one global store. Swap for a real DB keyed by openid
when wiring 微信登录.
"""
from __future__ import annotations

import copy
import threading

from .data import mock

_lock = threading.Lock()
_watch_ids: list[str] = [w["id"] for w in mock.WATCHLIST]
_positions: list[dict] = copy.deepcopy(mock.POSITIONS)


def watch_ids() -> list[str]:
    with _lock:
        return list(_watch_ids)


def toggle_watch(fund_id: str) -> bool:
    """Add/remove a fund from the watchlist. Returns True if now watched."""
    with _lock:
        if fund_id in _watch_ids:
            _watch_ids.remove(fund_id)
            return False
        _watch_ids.append(fund_id)
        return True


def positions() -> list[dict]:
    with _lock:
        return copy.deepcopy(_positions)


def buy(fund: dict, amount: int, mode: str) -> None:
    """Apply a simulated buy/SIP to the positions list."""
    shares = round(amount / fund["nav"]) if fund["nav"] else 0
    with _lock:
        existing = next((p for p in _positions if p["id"] == fund["id"]), None)
        if existing:
            existing["shares"] += shares
            if mode == "定投":
                existing["sip"] = True
                existing["sipAmt"] = amount
        else:
            _positions.append({
                "id": fund["id"], "name": fund["name"], "code": fund["code"],
                "cost": fund["nav"], "nav": fund["nav"], "shares": shares,
                "sip": mode == "定投", "sipAmt": amount if mode == "定投" else 0,
            })


def reset() -> None:
    """Restore seed state — used by tests."""
    global _watch_ids, _positions
    with _lock:
        _watch_ids = [w["id"] for w in mock.WATCHLIST]
        _positions = copy.deepcopy(mock.POSITIONS)
