"""Static editorial content — messages centre + data-source list.

These are app content (not market data), identical in dev and prod.
"""
from __future__ import annotations

import copy

from ..data import mock


def messages() -> list[dict]:
    return copy.deepcopy(mock.MESSAGES)


def sources() -> list[dict]:
    return copy.deepcopy(mock.SOURCES)
