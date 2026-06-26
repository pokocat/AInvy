"""API smoke + contract tests (dev env / mock data)."""
from __future__ import annotations

import os

os.environ["APP_ENV"] = "dev"

from fastapi.testclient import TestClient  # noqa: E402

from app import store  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def setup_function() -> None:
    store.reset()


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "env": "dev", "sources": None}


def test_brief_shape():
    r = client.get("/api/brief")
    assert r.status_code == 200
    body = r.json()
    assert body["summary"]
    assert len(body["sectors"]) == 7
    assert len(body["feed"]) == 5
    assert body["cats"][0] == "全部"
    # Only items flagged ai=True expose an AI解读 toggle in the UI.
    assert sum(1 for f in body["feed"] if f["ai"]) == 3


def test_funds_page():
    r = client.get("/api/funds")
    assert r.status_code == 200
    body = r.json()
    assert len(body["funds"]) == 8
    assert len(body["portfolios"]) == 3
    assert "QDII" in body["themes"]
    assert all(len(f["series"]) == 36 for f in body["funds"])


def test_fund_detail_and_404():
    assert client.get("/api/funds/u1").status_code == 200
    assert client.get("/api/funds/u1").json()["code"] == "270042"
    assert client.get("/api/funds/nope").status_code == 404


def test_tracking_seed():
    r = client.get("/api/tracking")
    body = r.json()
    assert {w["id"] for w in body["watch"]} == {"u1", "u3", "u5", "u7"}
    assert len(body["positions"]) == 3


def test_toggle_watch():
    # u2 not initially watched → add then remove.
    r = client.post("/api/tracking/watch", json={"fund_id": "u2"})
    assert any(w["id"] == "u2" for w in r.json()["watch"])
    r = client.post("/api/tracking/watch", json={"fund_id": "u2"})
    assert not any(w["id"] == "u2" for w in r.json()["watch"])


def test_buy_new_and_existing():
    # New position in u2.
    r = client.post("/api/tracking/buy", json={"fund_id": "u2", "amount": 2461, "mode": "定投"})
    pos = {p["id"]: p for p in r.json()["positions"]}
    assert "u2" in pos
    assert pos["u2"]["sip"] is True
    assert pos["u2"]["sipAmt"] == 2461
    assert pos["u2"]["shares"] == 1000  # 2461 / 2.461

    # Add to existing u1 position (seed shares 3500).
    r = client.post("/api/tracking/buy", json={"fund_id": "u1", "amount": 3182, "mode": "单次"})
    pos = {p["id"]: p for p in r.json()["positions"]}
    assert pos["u1"]["shares"] == 3500 + 1000  # 3182 / 3.182


def test_buy_unknown_fund():
    assert client.post("/api/tracking/buy", json={"fund_id": "zzz", "amount": 100, "mode": "单次"}).status_code == 404


def test_messages_and_sources():
    assert len(client.get("/api/messages").json()) == 5
    sources = client.get("/api/sources").json()
    assert len(sources) == 6
    assert any(not s["free"] for s in sources)  # the LLM source is paid


def test_analyze_samples():
    body = client.get("/api/analyze/samples").json()
    assert len(body["samples"]) == 4
    assert len(body["history"]) == 2
