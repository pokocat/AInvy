// data.jsx — mock content for 投小AI (dated ~2026-05-30)

const BRIEF_DATE = '2026年5月30日 · 周五';

// AI 一段话总结
const AI_SUMMARY =
  '隔夜美股科技股普涨，费城半导体指数创新高，AI算力与高带宽存储（HBM）需求外溢，' +
  'A股半导体、存储链早盘领涨。国内层面，央行加量续作MLF释放呵护信号，' +
  '"两新"以旧换新扩围文件落地利好家电与消费电子。今日你关注的红利与QDII方向整体平稳，' +
  'QDII纳指基金溢价小幅收窄，适合定投者按计划扣款，不必追高。';

const AI_POINTS = [
  { t: '存储涨价周期延续，HBM、利基DRAM供需偏紧', tone: 'up' },
  { t: '央行MLF加量续作，资金面维持宽松', tone: 'flat' },
  { t: '"以旧换新"扩围，家电/消费电子受益', tone: 'up' },
  { t: '北向资金净流入58.3亿，主买电子、有色', tone: 'up' },
  { t: '你的QDII定投今日按计划扣款（纳指、标普）', tone: 'flat' },
];

// 板块热度榜
const SECTORS = [
  { name: '半导体存储', heat: 98, chg: 4.62, tags: ['HBM', '涨价'], note: '存储现货价连涨，HBM供不应求' },
  { name: 'AI算力',    heat: 94, chg: 3.18, tags: ['英伟达', 'CPO'], note: '海外资本开支上修，光模块跟涨' },
  { name: '创新药',    heat: 81, chg: 2.05, tags: ['出海', 'BD'], note: '多笔license-out落地催化' },
  { name: '黄金',      heat: 76, chg: 1.12, tags: ['避险'], note: '实际利率回落，金价站稳高位' },
  { name: '红利低波',  heat: 64, chg: -0.34, tags: ['防御'], note: '高股息资产短期跑输成长' },
  { name: '消费电子',  heat: 58, chg: 1.74, tags: ['换新'], note: '以旧换新扩围带动需求预期' },
  { name: '军工',      heat: 41, chg: -0.88, tags: [], note: '订单兑现节奏放缓' },
];

// 信息流卡片
const FEED = [
  {
    id: 'f1', cat: '政策', accent: 'brand', time: '08:12', source: '央行公告', ai: true,
    title: '央行加量续作MLF 5000亿，资金面延续宽松',
    summary: '本月MLF到期4000亿，央行加量续作至5000亿，净投放1000亿，操作利率持平。',
    detail: '加量续作释放呵护流动性信号，结合月末时点，短端利率有望平稳。对债基、红利类资产偏正面；对成长股，宽松环境抬升风险偏好。对你的定投影响：维持原节奏，无需调整。',
  },
  {
    id: 'f2', cat: '热点', accent: 'up', time: '07:55', source: '产业链调研', ai: true,
    title: '存储涨价周期延续，HBM与利基DRAM供需双紧',
    summary: '原厂减产+AI需求拉动，DRAM/NAND现货价连续上涨，HBM订单已排至明年。',
    detail: '存储是本轮AI硬件外溢最明确的方向之一：HBM绑定算力需求，利基存储受益于工业、汽车补库。相关主题基金弹性大但波动高，适合小比例参与或用行业ETF定投平滑。',
  },
  {
    id: 'f3', cat: '全球', accent: 'flat', time: '06:40', source: '隔夜外盘', ai: true,
    title: '费城半导体指数创新高，纳指收涨1.3%',
    summary: '美股科技股普涨，AI算力链领涨，10年期美债收益率回落至4.2%。',
    detail: '外盘强势对A股、港股科技形成情绪映射。QDII纳指/标普基金净值将跟随上行，但需注意溢价与限购；高溢价时段定投建议拆分、避免追高。',
  },
  {
    id: 'f4', cat: '政策', accent: 'brand', time: '昨日 21:30', source: '发改委',
    title: '"以旧换新"扩围至更多家电与消费电子品类',
    summary: '补贴范围新增多个品类，地方配套资金跟进，刺激更新需求。',
    detail: '直接利好家电、消费电子龙头与零售渠道。属政策催化型机会，持续性取决于补贴力度与终端景气，适合作为主题卫星仓位而非核心定投。',
  },
  {
    id: 'f5', cat: '资金', accent: 'up', time: '昨日 15:10', source: '行情数据',
    title: '北向资金净流入58.3亿，主买电子与有色',
    summary: '连续三日净流入，电子、有色金属获增持，食品饮料遭小幅减持。',
    detail: '外资回流改善A股流动性预期，电子方向与本轮存储/算力主线一致。资金面信号可作为主题热度参考，但不建议据单日流向择时定投。',
  },
];

const CATS = ['全部', '政策', '热点', '全球', '资金'];

// 基金主题
const FUND_THEMES = ['全部', 'QDII', '半导体', '红利', '宽基', '黄金'];

// 净值走势 sparkline 数据生成（伪随机但稳定）
function navSeries(seed, n = 36, drift = 0.04, vol = 0.02) {
  const out = []; let v = 1;
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    v = v * (1 + drift / n + r * vol);
    out.push(v);
  }
  return out;
}

const FUNDS = [
  {
    id: 'u1', code: '270042', name: '广发纳指100ETF联接(QDII)', theme: 'QDII',
    type: '指数·美股', risk: '中高', y1: 31.4, sip: true, star: 4.6,
    nav: 3.182, navChg: 1.24, scale: '186亿', mgr: '刘杰',
    reason: '跟踪纳斯达克100，长期定投平滑汇率与估值波动，分散A股单一市场风险。',
    series: navSeries(11, 36, 0.10, 0.022),
  },
  {
    id: 'u2', code: '161128', name: '易方达标普500ETF联接(QDII)', theme: 'QDII',
    type: '指数·美股', risk: '中高', y1: 23.7, sip: true, star: 4.5,
    nav: 2.461, navChg: 0.92, scale: '142亿', mgr: '范冰',
    reason: '宽基美股核心资产，波动低于纳指，适合作为QDII定投打底仓位。',
    series: navSeries(23, 36, 0.08, 0.018),
  },
  {
    id: 'u3', code: '008887', name: '华夏国证半导体芯片ETF联接', theme: '半导体',
    type: '行业·半导体', risk: '高', y1: 18.9, sip: true, star: 4.1,
    nav: 1.347, navChg: 4.05, scale: '97亿', mgr: '赵宗庭',
    reason: '一键布局半导体设计/制造/设备/存储，弹性大；建议小比例、长周期定投平滑波动。',
    series: navSeries(37, 36, 0.06, 0.05),
  },
  {
    id: 'u4', code: '012815', name: '国泰存储芯片产业ETF联接', theme: '半导体',
    type: '主题·存储', risk: '高', y1: 26.3, sip: false, star: 3.9,
    nav: 1.612, navChg: 5.21, scale: '34亿', mgr: '艾小军',
    reason: '聚焦存储涨价主线，短期弹性强、波动剧烈；适合卫星仓位博弹性，不宜重仓。',
    series: navSeries(53, 36, 0.05, 0.07),
  },
  {
    id: 'u5', code: '515080', name: '中证红利ETF联接', theme: '红利',
    type: '指数·红利', risk: '中', y1: 9.8, sip: true, star: 4.7,
    nav: 1.428, navChg: -0.31, scale: '203亿', mgr: '苏燕青',
    reason: '高股息、低波动，提供现金流与防御性，是定投组合的"压舱石"。',
    series: navSeries(67, 36, 0.03, 0.012),
  },
  {
    id: 'u6', code: '110011', name: '易方达中小盘混合', theme: '宽基',
    type: '主动·混合', risk: '中', y1: 14.2, sip: true, star: 4.3,
    nav: 8.934, navChg: 0.78, scale: '88亿', mgr: '张坤',
    reason: '老牌主动权益，均衡配置消费与制造，适合作为A股核心定投。',
    series: navSeries(83, 36, 0.05, 0.02),
  },
  {
    id: 'u7', code: '518880', name: '华安黄金ETF联接', theme: '黄金',
    type: '商品·黄金', risk: '中', y1: 16.5, sip: true, star: 4.4,
    nav: 2.078, navChg: 1.08, scale: '156亿', mgr: '许之彦',
    reason: '对冲通胀与避险，与股债低相关；可作为组合10%以内的分散配置。',
    series: navSeries(97, 36, 0.06, 0.02),
  },
  {
    id: 'u8', code: '160119', name: '南方中证500ETF联接', theme: '宽基',
    type: '指数·宽基', risk: '中', y1: 11.6, sip: true, star: 4.2,
    nav: 1.873, navChg: 0.54, scale: '120亿', mgr: '罗文杰',
    reason: '中盘成长代表，与沪深300互补，适合宽基定投做风格分散。',
    series: navSeries(101, 36, 0.04, 0.022),
  },
];

// 组合推荐（高中低风险）
const PORTFOLIOS = [
  {
    id: 'p_low', name: '稳健打底', risk: '低', tag: '回撤优先',
    desc: '红利+黄金+债性资产为主，追求平稳现金流与低波动。',
    target: '年化目标 5–8%', items: [
      { name: '中证红利ETF联接', w: 50 },
      { name: '华安黄金ETF联接', w: 20 },
      { name: '标普500QDII', w: 30 },
    ],
  },
  {
    id: 'p_mid', name: '均衡成长', risk: '中', tag: '攻守兼备',
    desc: '宽基+QDII+红利搭配，兼顾成长弹性与防御。',
    target: '年化目标 8–12%', items: [
      { name: '纳指100QDII', w: 30 },
      { name: '沪深300/500宽基', w: 35 },
      { name: '中证红利', w: 20 },
      { name: '黄金', w: 15 },
    ],
  },
  {
    id: 'p_high', name: '进取弹性', risk: '高', tag: '博取超额',
    desc: '半导体/存储等主题卫星仓位放大弹性，需承受较大波动。',
    target: '年化目标 12%+', items: [
      { name: '半导体芯片ETF', w: 30 },
      { name: '纳指100QDII', w: 30 },
      { name: '中证500宽基', w: 25 },
      { name: '黄金对冲', w: 15 },
    ],
  },
];

// 自选
const WATCHLIST = [
  { id: 'u1', name: '广发纳指100QDII', code: '270042', nav: 3.182, chg: 1.24 },
  { id: 'u3', name: '华夏半导体芯片ETF', code: '008887', nav: 1.347, chg: 4.05 },
  { id: 'u5', name: '中证红利ETF联接', code: '515080', nav: 1.428, chg: -0.31 },
  { id: 'u7', name: '华安黄金ETF联接', code: '518880', nav: 2.078, chg: 1.08 },
];

// 模拟持仓
const POSITIONS = [
  { id: 'u1', name: '广发纳指100QDII', code: '270042', cost: 2.86, nav: 3.182, shares: 3500, sip: true, sipAmt: 1000 },
  { id: 'u5', name: '中证红利ETF联接', code: '515080', cost: 1.39, nav: 1.428, shares: 7200, sip: true, sipAmt: 800 },
  { id: 'u3', name: '华夏半导体芯片ETF', code: '008887', cost: 1.41, nav: 1.347, shares: 2000, sip: false, sipAmt: 0 },
];

// 消息中心
const MESSAGES = [
  { id: 'm1', type: '简报', icon: '报', title: '今日市场简报已生成', desc: 'AI已为你整理5条政策与全球热点，半导体存储领涨', time: '08:15', unread: true },
  { id: 'm2', type: '提醒', icon: '盯', title: '自选提醒 · 华夏半导体芯片ETF', desc: '今日大涨 +4.05%，触及你设置的涨幅提醒', time: '昨日 14:30', unread: true },
  { id: 'm3', type: '定投', icon: '投', title: '定投扣款成功 · 纳指100QDII', desc: '本期定投 ¥1,000 已扣款，份额确认中', time: '昨日 09:00', unread: false },
  { id: 'm4', type: '周报', icon: '周', title: '上周投资周报已生成', desc: '组合周收益 +1.8%，红利跑输成长，附本周关注', time: '周一 08:00', unread: false },
  { id: 'm5', type: '政策', icon: '策', title: '政策速递 · 以旧换新扩围', desc: '家电与消费电子受益，已加入今日简报', time: '5月28日', unread: false },
];

// ========== v2: 投喂分析引擎 + 数据源 ==========

// 概念 → 可投标的 映射（真实做法：维护此表 + 大模型抽取关键词后匹配）
const CONCEPT_MAP = [
  { id: 'cs',   concept: '存储芯片', keys: ['hbm','存储','内存','颗粒','dram','nand','美光','长江存储','闪存','涨价','晶圆厂'], funds: ['u4','u3'], dedicated: true },
  { id: 'semi', concept: '半导体',   keys: ['半导体','芯片','光刻','刻蚀','封测','国产替代','设备','算力','cpo','光模块','英伟达','gpu'], funds: ['u3','u4'], dedicated: true },
  { id: 'us',   concept: '美股科技', keys: ['纳指','纳斯达克','美股','nvidia','苹果','特斯拉','标普','美国','ai','英伟达'], funds: ['u1','u2'], dedicated: true },
  { id: 'gold', concept: '黄金避险', keys: ['黄金','金价','避险','美联储','降息','加息','通胀','地缘'], funds: ['u7'], dedicated: true },
  { id: 'div',  concept: '红利低波', keys: ['红利','高股息','分红','防御','稳健','低波','银行','煤炭','现金流'], funds: ['u5'], dedicated: true },
  { id: 'cons', concept: '消费内需', keys: ['消费','白酒','家电','以旧换新','内需','旅游','零售','医美'], funds: ['u6','u8'], dedicated: false, note: '暂无窄主题消费基金，建议用宽基/主动基金间接参与' },
  { id: 'broad',concept: '宽基指数', keys: ['沪深300','中证500','宽基','指数','大盘','a股','蓝筹'], funds: ['u8','u6'], dedicated: true },
  { id: 'batt', concept: '新能源·电池', keys: ['电池','固态','锂','光伏','新能源','储能','电动车','钠离子'], funds: ['u8'], dedicated: false, note: '优选池暂无纯电池主题基金，可用中证500等宽基间接参与' },
];

const POS_WORDS = ['大涨','涨价','创新高','新高','量产','获批','超预期','需求','订单','增长','利好','突破','放量','回暖','爆','火','上调','净流入','反弹','涨'];
const NEG_WORDS = ['下跌','暴跌','跌','亏损','减持','利空','监管','回调','下调','抛售','净流出','暴雷','承压','走弱'];
const RUMOR_WORDS = ['听说','据说','据传','网传','小道','朋友','可能','或将','内部','传闻','感觉','应该'];
const OFFICIAL_WORDS = ['公告','发布','财报','数据','统计','官方','披露','政策','央行','发改委','证监会','季报','年报'];

function countHits(t, words) { return words.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0); }

// 核心：解析投喂内容 → 结构化结果
function analyzeText(raw) {
  const text = (raw || '').toLowerCase();
  const scored = CONCEPT_MAP
    .map(c => ({ c, score: c.keys.filter(k => text.includes(k)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  let concepts, fundIds, fallbackNote = null;
  if (scored.length === 0) {
    concepts = [{ concept: '宽基指数', score: 0 }];
    fundIds = ['u8', 'u6'];
    fallbackNote = '未识别到明确主题，已按"宽基打底"给出通用建议。可补充更具体的行业/公司信息。';
  } else {
    concepts = scored.slice(0, 3).map(x => ({ concept: x.c.concept, score: x.score }));
    fundIds = [...new Set(scored.flatMap(x => x.c.funds))].slice(0, 3);
    const nd = scored.find(x => !x.c.dedicated && x.c.note);
    if (nd) fallbackNote = nd.c.note;
  }

  const pos = countHits(text, POS_WORDS), neg = countHits(text, NEG_WORDS);
  const tone = pos > neg ? '利好' : neg > pos ? '利空' : '中性';
  const rumor = countHits(text, RUMOR_WORDS), official = countHits(text, OFFICIAL_WORDS);
  const nature = official > rumor ? '官方·数据' : rumor > 0 ? '传闻·观点' : '市场观点';

  const conceptNames = concepts.map(c => c.concept).join('、');
  const summary = `这条信息可归类为「${nature}」，主要涉及 ${conceptNames}，市场情绪整体偏「${tone}」。下方为 AI 匹配到的可投标的与风险提示。`;

  const risk = [];
  if (tone === '利好' && concepts.some(c => ['存储芯片','半导体','美股科技'].includes(c.concept)))
    risk.push('相关板块短期情绪偏热，注意追高风险；建议小额分批或定投，而非一次性重仓买入。');
  if (nature === '传闻·观点')
    risk.push('信息源偏向传闻/个人观点，未经证实，仅作线索参考，切勿据此重仓。');
  if (concepts.some(c => c.concept === '黄金避险'))
    risk.push('黄金受美联储利率与汇率影响较大，配置比例建议控制在组合 10% 以内。');
  if (fallbackNote) risk.push(fallbackNote);
  risk.push('以上为 AI 对公开信息的梳理与匹配，不构成投资建议；最终决策请结合自身风险承受能力。');

  return { summary, tone, nature, concepts, fundIds, risk };
}

const ANALYZE_SAMPLES = [
  '隔夜英伟达大涨，HBM 需求爆棚，存储颗粒又涨价了',
  '听说固态电池要大规模量产，新能源是不是机会',
  '美联储可能要降息，黄金还能追吗',
  '想稳一点，求推荐防御型标的',
];

// 线索库（历史投喂）
const ANALYZE_HISTORY = [
  { id: 'h1', date: '06-12', text: '隔夜英伟达财报超预期，HBM 供不应求，存储现货价又涨了一轮', concepts: ['存储芯片','半导体'], fundIds: ['u4','u3'], tone: '利好', since: 6.2 },
  { id: 'h2', date: '06-08', text: '美联储点阵图偏鸽，市场押注三季度降息，黄金创新高', concepts: ['黄金避险','美股科技'], fundIds: ['u7','u1'], tone: '利好', since: 2.1 },
];

// 数据源与可实现方案（真实、免费为主）
const SOURCES = [
  { tag: '行情·估值', name: '天天基金 fundgz / 东方财富', desc: '基金实时估算净值、单位净值、估算涨跌，免费、无需鉴权', free: true },
  { tag: '全市场数据', name: 'AKShare（开源）', desc: 'A股/港股/美股行情、基金净值持仓、板块资金流、财经新闻；自建后端定时拉取', free: true },
  { tag: '极速快照', name: '新浪财经 hq.sinajs', desc: 'A股实时报价，毫秒级响应，免费（需控制请求频率）', free: true },
  { tag: '政策·新闻', name: 'AKShare 新闻 + 官方源', desc: '财经/个股新闻聚合，配合央行、发改委等官方公告', free: true },
  { tag: '消息推送', name: '微信订阅消息', desc: '用户一次性授权后推送每日简报/标的提醒，小程序内真实可用', free: true },
  { tag: 'AI 分析', name: '大模型 API（DeepSeek / 通义 / Kimi）', desc: '对投喂内容做关键词抽取、情绪判断与标的匹配', free: false },
];

Object.assign(window, {
  BRIEF_DATE, AI_SUMMARY, AI_POINTS, SECTORS, FEED, CATS,
  FUND_THEMES, FUNDS, PORTFOLIOS, WATCHLIST, POSITIONS, MESSAGES, navSeries,
  CONCEPT_MAP, analyzeText, ANALYZE_SAMPLES, ANALYZE_HISTORY, SOURCES,
});
