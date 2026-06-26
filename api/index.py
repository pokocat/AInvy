"""Vercel serverless entry for the 投小AI FastAPI backend.

Vercel turns this file into a single Function and serves the exposed ``app``
(ASGI). All requests under ``/api/*`` are rewritten here (see ``vercel.json``);
FastAPI's own routes are already prefixed with ``/api`` so the original path
matches unchanged.

Runs in ``dev`` (mock) mode by default so the demo is fully offline and needs
no API keys — flip ``APP_ENV=prod`` (plus the real-source env vars) in the
Vercel project settings to hit live data.
"""
import os
import sys

# Make the in-repo ``backend/`` package importable (``app`` is a package there).
_BACKEND = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, _BACKEND)

# Default to offline mock data unless the project overrides APP_ENV.
os.environ.setdefault("APP_ENV", "dev")

from app.main import app  # noqa: E402  (path set up above)

__all__ = ["app"]
