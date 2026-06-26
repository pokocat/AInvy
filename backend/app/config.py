"""Runtime configuration for the 投小AI backend.

Two environments drive the whole data strategy:

* ``dev``  — every service is served from the in-repo mock layer. Nothing
  reaches the network, so the app runs fully offline (local development,
  CI, demos).
* ``prod`` — every service hits the real free data sources (天天基金 fundgz,
  AKShare, 新浪财经, the LLM API). There is **deliberately no fallback to
  mock**: if a live source is down the request raises and the error
  surfaces to the caller. We never silently fabricate market data in prod.

Select the environment with ``APP_ENV=dev|prod`` (default ``dev``).
"""
from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

Env = Literal["dev", "prod"]


class Settings:
    """Process-wide settings, read once from the environment."""

    def __init__(self) -> None:
        self.app_env: Env = _read_env()
        # CORS origins for the H5 build / local Taro dev server.
        self.cors_origins: list[str] = _split(
            os.getenv("CORS_ORIGINS", "http://localhost:10086,http://127.0.0.1:10086")
        )

        # --- Real data source endpoints (only used when app_env == prod) ---
        self.fundgz_base = os.getenv("FUNDGZ_BASE", "https://fundgz.1234567.com.cn/js")
        self.sina_hq_base = os.getenv("SINA_HQ_BASE", "https://hq.sinajs.cn")

        # --- LLM (大模型) settings for the 投喂分析 feature ---
        # Default to DeepSeek's OpenAI-compatible endpoint; override for 通义/Kimi.
        self.llm_base = os.getenv("LLM_BASE", "https://api.deepseek.com")
        self.llm_model = os.getenv("LLM_MODEL", "deepseek-chat")
        self.llm_api_key = os.getenv("LLM_API_KEY", "")

        # Outbound HTTP timeout (seconds) for every real adapter.
        self.http_timeout = float(os.getenv("HTTP_TIMEOUT", "8"))

    @property
    def is_prod(self) -> bool:
        return self.app_env == "prod"

    @property
    def is_dev(self) -> bool:
        return self.app_env == "dev"


def _read_env() -> Env:
    value = os.getenv("APP_ENV", "dev").strip().lower()
    if value not in ("dev", "prod"):
        raise ValueError(f"APP_ENV must be 'dev' or 'prod', got {value!r}")
    return value  # type: ignore[return-value]


def _split(raw: str) -> list[str]:
    return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
