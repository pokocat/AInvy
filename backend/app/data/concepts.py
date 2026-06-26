"""投喂分析 rule engine — port of data.jsx ``analyzeText``.

This is the deterministic, offline matcher: keyword → concept → investable
fund, plus sentiment (利好/利空) and nature (官方·数据/传闻) heuristics. In
``prod`` the LLM adapter can replace concept extraction, but this engine is
always the dev path and the LLM's fallback structure.
"""
from __future__ import annotations

from .mock import funds_by_id

# 概念 → 可投标的 映射
CONCEPT_MAP = [
    {"id": "cs", "concept": "存储芯片", "keys": ["hbm", "存储", "内存", "颗粒", "dram", "nand", "美光", "长江存储", "闪存", "涨价", "晶圆厂"], "funds": ["u4", "u3"], "dedicated": True},
    {"id": "semi", "concept": "半导体", "keys": ["半导体", "芯片", "光刻", "刻蚀", "封测", "国产替代", "设备", "算力", "cpo", "光模块", "英伟达", "gpu"], "funds": ["u3", "u4"], "dedicated": True},
    {"id": "us", "concept": "美股科技", "keys": ["纳指", "纳斯达克", "美股", "nvidia", "苹果", "特斯拉", "标普", "美国", "ai", "英伟达"], "funds": ["u1", "u2"], "dedicated": True},
    {"id": "gold", "concept": "黄金避险", "keys": ["黄金", "金价", "避险", "美联储", "降息", "加息", "通胀", "地缘"], "funds": ["u7"], "dedicated": True},
    {"id": "div", "concept": "红利低波", "keys": ["红利", "高股息", "分红", "防御", "稳健", "低波", "银行", "煤炭", "现金流"], "funds": ["u5"], "dedicated": True},
    {"id": "cons", "concept": "消费内需", "keys": ["消费", "白酒", "家电", "以旧换新", "内需", "旅游", "零售", "医美"], "funds": ["u6", "u8"], "dedicated": False, "note": "暂无窄主题消费基金，建议用宽基/主动基金间接参与"},
    {"id": "broad", "concept": "宽基指数", "keys": ["沪深300", "中证500", "宽基", "指数", "大盘", "a股", "蓝筹"], "funds": ["u8", "u6"], "dedicated": True},
    {"id": "batt", "concept": "新能源·电池", "keys": ["电池", "固态", "锂", "光伏", "新能源", "储能", "电动车", "钠离子"], "funds": ["u8"], "dedicated": False, "note": "优选池暂无纯电池主题基金，可用中证500等宽基间接参与"},
]

POS_WORDS = ["大涨", "涨价", "创新高", "新高", "量产", "获批", "超预期", "需求", "订单", "增长", "利好", "突破", "放量", "回暖", "爆", "火", "上调", "净流入", "反弹", "涨"]
NEG_WORDS = ["下跌", "暴跌", "跌", "亏损", "减持", "利空", "监管", "回调", "下调", "抛售", "净流出", "暴雷", "承压", "走弱"]
RUMOR_WORDS = ["听说", "据说", "据传", "网传", "小道", "朋友", "可能", "或将", "内部", "传闻", "感觉", "应该"]
OFFICIAL_WORDS = ["公告", "发布", "财报", "数据", "统计", "官方", "披露", "政策", "央行", "发改委", "证监会", "季报", "年报"]


def _count_hits(text: str, words: list[str]) -> int:
    return sum(1 for w in words if w in text)


def analyze_text(raw: str) -> dict:
    """Parse 投喂 content into a structured result dict.

    Returns keys: summary, tone, nature, concepts (list of {concept, score}),
    fund_ids (list[str]), risk (list[str]). The router decorates fund_ids into
    full fund objects with a relevance score.
    """
    text = (raw or "").lower()
    scored = sorted(
        (
            {"c": c, "score": sum(1 for k in c["keys"] if k in text)}
            for c in CONCEPT_MAP
        ),
        key=lambda x: x["score"],
        reverse=True,
    )
    scored = [x for x in scored if x["score"] > 0]

    fallback_note: str | None = None
    if not scored:
        concepts = [{"concept": "宽基指数", "score": 0}]
        fund_ids = ["u8", "u6"]
        fallback_note = "未识别到明确主题，已按“宽基打底”给出通用建议。可补充更具体的行业/公司信息。"
    else:
        concepts = [{"concept": x["c"]["concept"], "score": x["score"]} for x in scored[:3]]
        seen: list[str] = []
        for x in scored:
            for fid in x["c"]["funds"]:
                if fid not in seen:
                    seen.append(fid)
        fund_ids = seen[:3]
        nd = next((x for x in scored if not x["c"]["dedicated"] and x["c"].get("note")), None)
        if nd:
            fallback_note = nd["c"]["note"]

    pos, neg = _count_hits(text, POS_WORDS), _count_hits(text, NEG_WORDS)
    tone = "利好" if pos > neg else "利空" if neg > pos else "中性"
    rumor, official = _count_hits(text, RUMOR_WORDS), _count_hits(text, OFFICIAL_WORDS)
    nature = "官方·数据" if official > rumor else "传闻·观点" if rumor > 0 else "市场观点"

    concept_names = "、".join(c["concept"] for c in concepts)
    summary = (
        f"这条信息可归类为「{nature}」，主要涉及 {concept_names}，"
        f"市场情绪整体偏「{tone}」。下方为 AI 匹配到的可投标的与风险提示。"
    )

    risk: list[str] = []
    if tone == "利好" and any(c["concept"] in ("存储芯片", "半导体", "美股科技") for c in concepts):
        risk.append("相关板块短期情绪偏热，注意追高风险；建议小额分批或定投，而非一次性重仓买入。")
    if nature == "传闻·观点":
        risk.append("信息源偏向传闻/个人观点，未经证实，仅作线索参考，切勿据此重仓。")
    if any(c["concept"] == "黄金避险" for c in concepts):
        risk.append("黄金受美联储利率与汇率影响较大，配置比例建议控制在组合 10% 以内。")
    if fallback_note:
        risk.append(fallback_note)
    risk.append("以上为 AI 对公开信息的梳理与匹配，不构成投资建议；最终决策请结合自身风险承受能力。")

    return {
        "summary": summary,
        "tone": tone,
        "nature": nature,
        "concepts": concepts,
        "fund_ids": fund_ids,
        "risk": risk,
    }


def concept_funds(concept_names: list[str]) -> list[str]:
    """Map a list of concept names (e.g. from the LLM) back to fund ids."""
    by_name = {c["concept"]: c for c in CONCEPT_MAP}
    seen: list[str] = []
    for name in concept_names:
        c = by_name.get(name)
        if not c:
            continue
        for fid in c["funds"]:
            if fid not in seen:
                seen.append(fid)
    return seen[:3] or ["u8", "u6"]


def valid_fund_id(fid: str) -> bool:
    return fid in funds_by_id()
