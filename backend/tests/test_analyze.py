"""Tests for the 投喂分析 rule engine (dev env)."""
from __future__ import annotations

import os

os.environ["APP_ENV"] = "dev"

from fastapi.testclient import TestClient  # noqa: E402

from app.data.concepts import analyze_text  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def test_storage_chip_case():
    """The canonical HBM/存储/英伟达 input from the chat transcript."""
    res = analyze_text("隔夜英伟达大涨，HBM 需求爆棚，存储颗粒又涨价了")
    names = [c["concept"] for c in res["concepts"]]
    assert "存储芯片" in names
    assert res["tone"] == "利好"
    # 存储 funds u4/u3 should lead the matches.
    assert res["fund_ids"][0] in ("u4", "u3")


def test_rumor_detected():
    res = analyze_text("听说固态电池要大规模量产，新能源是不是机会")
    assert res["nature"] == "传闻·观点"
    assert any("传闻" in r for r in res["risk"])


def test_gold_risk_note():
    res = analyze_text("美联储可能要降息，黄金还能追吗")
    assert any(c["concept"] == "黄金避险" for c in res["concepts"])
    assert any("黄金" in r for r in res["risk"])


def test_unmatched_fallback():
    res = analyze_text("今天天气不错适合散步")
    assert res["concepts"][0]["concept"] == "宽基指数"
    assert res["fund_ids"] == ["u8", "u6"]


def test_analyze_endpoint_relevance_and_engine():
    r = client.post("/api/analyze", json={"text": "英伟达大涨，HBM 涨价，存储火爆"})
    assert r.status_code == 200
    body = r.json()
    assert body["engine"] == "rule"
    rels = [m["relevance"] for m in body["matches"]]
    assert rels == sorted(rels, reverse=True)  # descending relevance
    assert rels[0] == 92
    assert body["matches"][0]["fund"]["id"] in ("u4", "u3")


def test_analyze_validation():
    assert client.post("/api/analyze", json={"text": ""}).status_code == 422
