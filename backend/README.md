# 投小AI · AInvy — Backend (FastAPI)

投顾小助手的后端：**简报 / 优选 / 持仓 / 消息 / 投喂分析**。

## 数据策略

| 环境 | `APP_ENV` | 行为 |
|------|-----------|------|
| 开发 | `dev`（默认） | 全部走仓库内 mock 数据，**完全离线**，无需任何外部依赖 |
| 生产 | `prod` | 全部走真实免费数据源，**无兜底回退** —— 某个源失败就返回 `502`，绝不伪造行情 |

设计取舍：基金的**编辑性元数据**（名称、主题、风险、推荐理由、评级、规模、经理）始终来自仓库——这是我们的分析观点，不是行情；只有**价格**（盘中估算净值 / 估算涨跌 / 净值走势）在 `prod` 下来自实时源。

## 真实数据源（prod）

| 能力 | 源 | 适配器 |
|------|----|--------|
| 基金盘中估算净值 / 单位净值 | 天天基金 `fundgz.1234567.com.cn/js/{code}.js`（免费、免鉴权） | `app/adapters/fundgz.py` |
| 板块热度 / 净值走势 / 财经新闻 | AKShare（开源，Python） | `app/adapters/akshare_src.py` |
| A股毫秒级快照 | 新浪财经 `hq.sinajs.cn` | `app/adapters/sina.py` |
| 投喂分析（概念抽取 / 情绪 / 风险） | 大模型 API（DeepSeek / 通义 / Kimi，OpenAI 兼容） | `app/adapters/llm.py` |

任一源失败都会抛 `SourceError`，由 `main.py` 统一转成 `502 {error, source, detail}`。

## 运行

```bash
cd backend

# 开发（mock，离线，推荐先跑这个）
pip install -r requirements-dev.txt
APP_ENV=dev uvicorn app.main:app --reload --port 8000

# 生产（真实数据，需要 akshare + LLM key）
pip install -r requirements.txt
cp .env.example .env          # 填入 LLM_API_KEY 等
APP_ENV=prod uvicorn app.main:app --port 8000
```

打开 <http://localhost:8000/docs> 看交互式 API 文档。

## 测试

```bash
cd backend && APP_ENV=dev pytest
```

## API 一览（前缀 `/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 + 当前环境 |
| GET | `/brief` | 今日简报（AI总结 / 要点 / 板块热度榜 / 信息流） |
| GET | `/funds` | 优选列表 + 主题 + 组合推荐 |
| GET | `/funds/{id}` | 单只基金详情（净值走势 / 推荐理由） |
| GET | `/tracking` | 自选 + 模拟持仓（含实时净值与盈亏） |
| POST | `/tracking/watch` | 切换自选 `{fund_id}` |
| POST | `/tracking/buy` | 模拟买入/定投 `{fund_id, amount, mode}` |
| GET | `/messages` | 消息中心列表 |
| GET | `/sources` | 数据源与实现方案 |
| POST | `/analyze` | 投喂分析 `{text}` → 概念 / 情绪 / 可投标的 / 风险 |
| GET | `/analyze/samples` | 投喂示例 + 线索库历史 |

## 结构

```
app/
  config.py          # dev/prod 开关 + 环境变量
  schemas.py         # Pydantic 契约（与前端共享）
  main.py            # FastAPI 入口 + SourceError→502
  store.py           # 自选/持仓内存态（生产可换云数据库）
  data/
    mock.py          # 移植自原型 data.jsx 的 mock 内容
    concepts.py      # 概念→标的映射 + 规则版投喂分析引擎
  adapters/          # 真实数据源（仅 prod，失败即报错）
  services/          # dev/prod 分流的业务逻辑
  routers/           # REST 端点
```
