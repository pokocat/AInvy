"""优选 (funds + portfolios + fund detail) endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas import Fund, FundsPage
from ..services import funds as funds_service

router = APIRouter(tags=["funds"])


@router.get("/funds", response_model=FundsPage)
def get_funds() -> FundsPage:
    return FundsPage(**funds_service.funds_page())


@router.get("/funds/{fund_id}", response_model=Fund)
def get_fund(fund_id: str) -> Fund:
    fund = funds_service.get_fund(fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail=f"未找到基金 {fund_id}")
    return Fund(**fund)
