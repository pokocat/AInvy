"""消息中心 + 数据源 endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from ..schemas import Message, Source
from ..services import content

router = APIRouter(tags=["content"])


@router.get("/messages", response_model=list[Message])
def get_messages() -> list[Message]:
    return [Message(**m) for m in content.messages()]


@router.get("/sources", response_model=list[Source])
def get_sources() -> list[Source]:
    return [Source(**s) for s in content.sources()]
