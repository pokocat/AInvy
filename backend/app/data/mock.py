"""Mock content for 投小AI, ported from the prototype's data.jsx (dated ~2026-05-30).

Used verbatim in ``dev`` and as the seed shape that the real adapters fill in
``prod``. The net-value sparkline generator is a faithful port of ``navSeries``
so charts look identical to the prototype.
"""
from __future__ import annotations

BRIEF_DATE = "2026年5月30日 · 周五"

AI_SUMMARY = (
    "隔夜美股科技股普涨，费城半导体指数创新高，AI算力与高带宽存储（HBM）需求外溢，"
    "A股半导体、存储链早盘领涨。国内层面，央行加量续作MLF释放呵护信号，"
    "“两新”以旧换新扩围文件落地利好家电与消费电子。今日你关注的红利与QDII方向整体平稳，"
    "QDII纳指基金溢价小幅收窄，适合定投者按计划扣款，不必追高。"
)

AI_POINTS = [
    {"t": "存储涨价周期延续，HBM、利基DRAM供需偏紧", "tone": "up"},
    {"t": "央行MLF加量续作，资金面维持宽松", "tone": "flat"},
    {"t": "“以旧换新”扩围，家电/消费电子受益", "tone": "up"},
    {"t": "北向资金净流入58.3亿，主买电子、有色", "tone": "up"},
    {"t": "你的QDII定投今日按计划扣款（纳指、标普）", "tone": "flat"},
]

SECTORS = [
    {"name": "半导体存储", "heat": 98, "chg": 4.62, "tags": ["HBM", "涨价"], "note": "存储现货价连涨，HBM供不应求"},
    {"name": "AI算力", "heat": 94, "chg": 3.18, "tags": ["英伟达", "CPO"], "note": "海外资本开支上修，光模块跟涨"},
    {"name": "创新药", "heat": 81, "chg": 2.05, "tags": ["出海", "BD"], "note": "多笔license-out落地催化"},
    {"name": "黄金", "heat": 76, "chg": 1.12, "tags": ["避险"], "note": "实际利率回落，金价站稳高位"},
    {"name": "红利低波", "heat": 64, "chg": -0.34, "tags": ["防御"], "note": "高股息资产短期跑输成长"},
    {"name": "消费电子", "heat": 58, "chg": 1.74, "tags": ["换新"], "note": "以旧换新扩围带动需求预期"},
    {"name": "军工", "heat": 41, "chg": -0.88, "tags": [], "note": "订单兑现节奏放缓"},
]

FEED = [
    {
        "id": "f1", "cat": "政策", "accent": "brand", "time": "08:12", "source": "央行公告", "ai": True,
        "title": "央行加量续作MLF 5000亿，资金面延续宽松",
        "summary": "本月MLF到期4000亿，央行加量续作至5000亿，净投放1000亿，操作利率持平。",
        "detail": "加量续作释放呵护流动性信号，结合月末时点，短端利率有望平稳。对债基、红利类资产偏正面；对成长股，宽松环境抬升风险偏好。对你的定投影响：维持原节奏，无需调整。",
    },
    {
        "id": "f2", "cat": "热点", "accent": "up", "time": "07:55", "source": "产业链调研", "ai": True,
        "title": "存储涨价周期延续，HBM与利基DRAM供需双紧",
        "summary": "原厂减产+AI需求拉动，DRAM/NAND现货价连续上涨，HBM订单已排至明年。",
        "detail": "存储是本轮AI硬件外溢最明确的方向之一：HBM绑定算力需求，利基存储受益于工业、汽车补库。相关主题基金弹性大但波动高，适合小比例参与或用行业ETF定投平滑。",
    },
    {
        "id": "f3", "cat": "全球", "accent": "flat", "time": "06:40", "source": "隔夜外盘", "ai": True,
        "title": "费城半导体指数创新高，纳指收涨1.3%",
        "summary": "美股科技股普涨，AI算力链领涨，10年期美债收益率回落至4.2%。",
        "detail": "外盘强势对A股、港股科技形成情绪映射。QDII纳指/标普基金净值将跟随上行，但需注意溢价与限购；高溢价时段定投建议拆分、避免追高。",
    },
    {
        "id": "f4", "cat": "政策", "accent": "brand", "time": "昨日 21:30", "source": "发改委", "ai": False,
        "title": "“以旧换新”扩围至更多家电与消费电子品类",
        "summary": "补贴范围新增多个品类，地方配套资金跟进，刺激更新需求。",
        "detail": "直接利好家电、消费电子龙头与零售渠道。属政策催化型机会，持续性取决于补贴力度与终端景气，适合作为主题卫星仓位而非核心定投。",
    },
    {
        "id": "f5", "cat": "资金", "accent": "up", "time": "昨日 15:10", "source": "行情数据", "ai": False,
        "title": "北向资金净流入58.3亿，主买电子与有色",
        "summary": "连续三日净流入，电子、有色金属获增持，食品饮料遭小幅减持。",
        "detail": "外资回流改善A股流动性预期，电子方向与本轮存储/算力主线一致。资金面信号可作为主题热度参考，但不建议据单日流向择时定投。",
    },
]

CATS = ["全部", "政策", "热点", "全球", "资金"]
FUND_THEMES = ["全部", "QDII", "半导体", "红利", "宽基", "黄金"]


def nav_series(seed: int, n: int = 36, drift: float = 0.04, vol: float = 0.02) -> list[float]:
    """Faithful port of data.jsx ``navSeries`` — a stable pseudo-random walk."""
    out: list[float] = []
    v = 1.0
    s = seed
    for _ in range(n):
        s = (s * 9301 + 49297) % 233280
        r = s / 233280 - 0.5
        v = v * (1 + drift / n + r * vol)
        out.append(round(v, 6))
    return out


# Each fund keeps its sparkline seed so prod can regenerate the same shape when
# real history is unavailable for that range.
_FUND_DEFS = [
    ("u1", "270042", "广发纳指100ETF联接(QDII)", "QDII", "指数·美股", "中高", 31.4, True, 4.6, 3.182, 1.24, "186亿", "刘杰",
     "跟踪纳斯达克100，长期定投平滑汇率与估值波动，分散A股单一市场风险。", (11, 0.10, 0.022)),
    ("u2", "161128", "易方达标普500ETF联接(QDII)", "QDII", "指数·美股", "中高", 23.7, True, 4.5, 2.461, 0.92, "142亿", "范冰",
     "宽基美股核心资产，波动低于纳指，适合作为QDII定投打底仓位。", (23, 0.08, 0.018)),
    ("u3", "008887", "华夏国证半导体芯片ETF联接", "半导体", "行业·半导体", "高", 18.9, True, 4.1, 1.347, 4.05, "97亿", "赵宗庭",
     "一键布局半导体设计/制造/设备/存储，弹性大；建议小比例、长周期定投平滑波动。", (37, 0.06, 0.05)),
    ("u4", "012815", "国泰存储芯片产业ETF联接", "半导体", "主题·存储", "高", 26.3, False, 3.9, 1.612, 5.21, "34亿", "艾小军",
     "聚焦存储涨价主线，短期弹性强、波动剧烈；适合卫星仓位博弹性，不宜重仓。", (53, 0.05, 0.07)),
    ("u5", "515080", "中证红利ETF联接", "红利", "指数·红利", "中", 9.8, True, 4.7, 1.428, -0.31, "203亿", "苏燕青",
     "高股息、低波动，提供现金流与防御性，是定投组合的“压舱石”。", (67, 0.03, 0.012)),
    ("u6", "110011", "易方达中小盘混合", "宽基", "主动·混合", "中", 14.2, True, 4.3, 8.934, 0.78, "88亿", "张坤",
     "老牌主动权益，均衡配置消费与制造，适合作为A股核心定投。", (83, 0.05, 0.02)),
    ("u7", "518880", "华安黄金ETF联接", "黄金", "商品·黄金", "中", 16.5, True, 4.4, 2.078, 1.08, "156亿", "许之彦",
     "对冲通胀与避险，与股债低相关；可作为组合10%以内的分散配置。", (97, 0.06, 0.02)),
    ("u8", "160119", "南方中证500ETF联接", "宽基", "指数·宽基", "中", 11.6, True, 4.2, 1.873, 0.54, "120亿", "罗文杰",
     "中盘成长代表，与沪深300互补，适合宽基定投做风格分散。", (101, 0.04, 0.022)),
]


def _build_funds() -> list[dict]:
    funds = []
    for (fid, code, name, theme, typ, risk, y1, sip, star, nav, navchg, scale, mgr, reason, seed) in _FUND_DEFS:
        funds.append({
            "id": fid, "code": code, "name": name, "theme": theme, "type": typ, "risk": risk,
            "y1": y1, "sip": sip, "star": star, "nav": nav, "navChg": navchg, "scale": scale,
            "mgr": mgr, "reason": reason,
            "series": nav_series(seed[0], 36, seed[1], seed[2]),
        })
    return funds


FUNDS = _build_funds()
# Code → sparkline seed, so the real adapter can rebuild matching series.
FUND_SEED = {d[1]: d[14] for d in _FUND_DEFS}

PORTFOLIOS = [
    {
        "id": "p_low", "name": "稳健打底", "risk": "低", "tag": "回撤优先",
        "desc": "红利+黄金+债性资产为主，追求平稳现金流与低波动。",
        "target": "年化目标 5–8%",
        "items": [{"name": "中证红利ETF联接", "w": 50}, {"name": "华安黄金ETF联接", "w": 20}, {"name": "标普500QDII", "w": 30}],
    },
    {
        "id": "p_mid", "name": "均衡成长", "risk": "中", "tag": "攻守兼备",
        "desc": "宽基+QDII+红利搭配，兼顾成长弹性与防御。",
        "target": "年化目标 8–12%",
        "items": [{"name": "纳指100QDII", "w": 30}, {"name": "沪深300/500宽基", "w": 35}, {"name": "中证红利", "w": 20}, {"name": "黄金", "w": 15}],
    },
    {
        "id": "p_high", "name": "进取弹性", "risk": "高", "tag": "博取超额",
        "desc": "半导体/存储等主题卫星仓位放大弹性，需承受较大波动。",
        "target": "年化目标 12%+",
        "items": [{"name": "半导体芯片ETF", "w": 30}, {"name": "纳指100QDII", "w": 30}, {"name": "中证500宽基", "w": 25}, {"name": "黄金对冲", "w": 15}],
    },
]

WATCHLIST = [
    {"id": "u1", "name": "广发纳指100QDII", "code": "270042", "nav": 3.182, "chg": 1.24},
    {"id": "u3", "name": "华夏半导体芯片ETF", "code": "008887", "nav": 1.347, "chg": 4.05},
    {"id": "u5", "name": "中证红利ETF联接", "code": "515080", "nav": 1.428, "chg": -0.31},
    {"id": "u7", "name": "华安黄金ETF联接", "code": "518880", "nav": 2.078, "chg": 1.08},
]

POSITIONS = [
    {"id": "u1", "name": "广发纳指100QDII", "code": "270042", "cost": 2.86, "nav": 3.182, "shares": 3500, "sip": True, "sipAmt": 1000},
    {"id": "u5", "name": "中证红利ETF联接", "code": "515080", "cost": 1.39, "nav": 1.428, "shares": 7200, "sip": True, "sipAmt": 800},
    {"id": "u3", "name": "华夏半导体芯片ETF", "code": "008887", "cost": 1.41, "nav": 1.347, "shares": 2000, "sip": False, "sipAmt": 0},
]

MESSAGES = [
    {"id": "m1", "type": "简报", "icon": "报", "title": "今日市场简报已生成", "desc": "AI已为你整理5条政策与全球热点，半导体存储领涨", "time": "08:15", "unread": True},
    {"id": "m2", "type": "提醒", "icon": "盯", "title": "自选提醒 · 华夏半导体芯片ETF", "desc": "今日大涨 +4.05%，触及你设置的涨幅提醒", "time": "昨日 14:30", "unread": True},
    {"id": "m3", "type": "定投", "icon": "投", "title": "定投扣款成功 · 纳指100QDII", "desc": "本期定投 ¥1,000 已扣款，份额确认中", "time": "昨日 09:00", "unread": False},
    {"id": "m4", "type": "周报", "icon": "周", "title": "上周投资周报已生成", "desc": "组合周收益 +1.8%，红利跑输成长，附本周关注", "time": "周一 08:00", "unread": False},
    {"id": "m5", "type": "政策", "icon": "策", "title": "政策速递 · 以旧换新扩围", "desc": "家电与消费电子受益，已加入今日简报", "time": "5月28日", "unread": False},
]

ANALYZE_SAMPLES = [
    "隔夜英伟达大涨，HBM 需求爆棚，存储颗粒又涨价了",
    "听说固态电池要大规模量产，新能源是不是机会",
    "美联储可能要降息，黄金还能追吗",
    "想稳一点，求推荐防御型标的",
]

ANALYZE_HISTORY = [
    {"id": "h1", "date": "06-12", "text": "隔夜英伟达财报超预期，HBM 供不应求，存储现货价又涨了一轮", "concepts": ["存储芯片", "半导体"], "fundIds": ["u4", "u3"], "tone": "利好", "since": 6.2},
    {"id": "h2", "date": "06-08", "text": "美联储点阵图偏鸽，市场押注三季度降息，黄金创新高", "concepts": ["黄金避险", "美股科技"], "fundIds": ["u7", "u1"], "tone": "利好", "since": 2.1},
]

SOURCES = [
    {"tag": "行情·估值", "name": "天天基金 fundgz / 东方财富", "desc": "基金实时估算净值、单位净值、估算涨跌，免费、无需鉴权", "free": True},
    {"tag": "全市场数据", "name": "AKShare（开源）", "desc": "A股/港股/美股行情、基金净值持仓、板块资金流、财经新闻；自建后端定时拉取", "free": True},
    {"tag": "极速快照", "name": "新浪财经 hq.sinajs", "desc": "A股实时报价，毫秒级响应，免费（需控制请求频率）", "free": True},
    {"tag": "政策·新闻", "name": "AKShare 新闻 + 官方源", "desc": "财经/个股新闻聚合，配合央行、发改委等官方公告", "free": True},
    {"tag": "消息推送", "name": "微信订阅消息", "desc": "用户一次性授权后推送每日简报/标的提醒，小程序内真实可用", "free": True},
    {"tag": "AI 分析", "name": "大模型 API（DeepSeek / 通义 / Kimi）", "desc": "对投喂内容做关键词抽取、情绪判断与标的匹配", "free": False},
]


def funds_by_id() -> dict[str, dict]:
    return {f["id"]: f for f in FUNDS}


def funds_by_code() -> dict[str, dict]:
    return {f["code"]: f for f in FUNDS}
