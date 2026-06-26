"""简报 (daily briefing) endpoint."""
from __future__ import annotations

from fastapi import APIRouter

from ..schemas import Brief
from ..services import market

router = APIRouter(tags=["brief"])


@router.get("/brief", response_model=Brief)
def get_brief() -> Brief:
    return Brief(**market.get_brief())
