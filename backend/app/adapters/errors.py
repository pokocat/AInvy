"""Shared error type for real data adapters.

Raised whenever a live source is unreachable or returns something we can't
parse. The routers turn it into a 502 so the failure is **visible** — in prod
we never silently fall back to mock data.
"""
from __future__ import annotations


class SourceError(RuntimeError):
    """A live upstream data source failed."""

    def __init__(self, source: str, detail: str):
        self.source = source
        self.detail = detail
        super().__init__(f"[{source}] {detail}")
