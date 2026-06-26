"""持仓 (watchlist + simulated positions) endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas import BuyReq, Tracking, WatchToggleReq
from ..services import tracking as tracking_service

router = APIRouter(tags=["tracking"])


@router.get("/tracking", response_model=Tracking)
def get_tracking() -> Tracking:
    return Tracking(**tracking_service.tracking())


@router.post("/tracking/watch", response_model=Tracking)
def toggle_watch(req: WatchToggleReq) -> Tracking:
    tracking_service.toggle_watch(req.fund_id)
    return Tracking(**tracking_service.tracking())


@router.post("/tracking/buy", response_model=Tracking)
def buy(req: BuyReq) -> Tracking:
    result = tracking_service.buy(req.fund_id, req.amount, req.mode)
    if result is None:
        raise HTTPException(status_code=404, detail=f"未找到基金 {req.fund_id}")
    return Tracking(**result)
