# 投小AI · AInvy — 投顾小助手

一个 AI 投顾小助手：每日市场简报、基金优选与组合推荐、模拟持仓、订阅消息推送，以及核心的**「投喂分析」**——把你看到的新闻/传闻丢给 AI，自动抽取概念、研判情绪、匹配可投标的。

本仓库是从 [Claude Design](https://claude.ai/design) 原型出发，落地为可运行的**前后端完整实现**。

| 端 | 技术 | 目录 |
|----|------|------|
| 前端 | **Taro**（React + TS）→ 微信小程序 + H5 | [`frontend/`](frontend/) |
| 后端 | **FastAPI**（Python） | [`backend/`](backend/) |
| 设计原型 / 需求 | 原始 HTML 原型 + 对话记录 | `project/`、`chats/` |

## 架构

```
微信小程序 / H5  (Taro)
        │  HTTPS  /api/*
        ▼
   FastAPI 后端
        │  dev: 仓库内 mock（离线）
        │  prod: 真实免费数据源（无兜底，失败即 502）
        ▼
 天天基金 fundgz · AKShare · 新浪财经 · 大模型 API
```

**数据策略**（按需求确定）：开发环境用 mock，完全离线可跑；**生产环境直连真实数据源、不做兜底回退**——某个源挂了就如实抛 `502`，绝不伪造行情。详见 [`backend/README.md`](backend/README.md)。

## 快速开始

需要两个终端：后端 + 前端。

### 1. 后端（FastAPI）

```bash
cd backend
pip install -r requirements-dev.txt           # dev 仅需轻量依赖（mock，离线）
APP_ENV=dev uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs  交互式 API 文档
```

测试：`cd backend && APP_ENV=dev pytest`（16 项全过）。

生产模式：`pip install -r requirements.txt`（含 akshare），配置 `cp .env.example .env` 填入 `LLM_API_KEY`，再 `APP_ENV=prod uvicorn app.main:app --port 8000`。

### 2. 前端（Taro）

```bash
cd frontend
npm install

# H5（浏览器预览最方便）
npm run build:h5
cd dist && python3 -m http.server 10086
# → http://localhost:10086/index.html

# 微信小程序
npm run build:weapp        # 用微信开发者工具打开 frontend/ 目录
```

前端默认连 `http://localhost:8000`；换地址用 `TARO_APP_API=https://api.example.com npm run build:h5`。

## 已验证

- 后端：16 项 pytest 全过；`/docs` 11 个端点正常。
- 前端：`build:h5` 与 `build:weapp` 均编译通过。
- 端到端（H5 + 后端，无头浏览器）：简报加载、优选/组合、打开详情、加自选（`POST /tracking/watch`）、模拟定投买入（`POST /tracking/buy`）、投喂分析（`POST /analyze` → 情绪/性质/摘要/概念/可投标的+关联度/风险提示）全部跑通，无控制台报错。

## 功能对照（与原型一致）

- **简报** — AI 一段话总结 + 要点 → 板块热度榜 → 动态信息流（部分卡片可展开 AI 解读）
- **优选** — 高/中/低风险组合推荐 + 按主题（QDII/半导体/红利/宽基/黄金）精选；详情页含净值走势 + 定投计算器
- **持仓** — 模拟持仓（市值/盈亏/今日盈亏）+ 自选
- **消息** — 微信订阅消息通知列表
- **投喂分析** — 文字/链接/截图 → AI 概念抽取 + 标的匹配（关联度）+ 情绪/性质研判 + 风险提示 → 一键加自选/模拟买入/存入线索库

## 关于设计原型

`project/` 是 Claude Design 导出的可点击 HTML 原型，`chats/` 是产品需求的完整对话。它们是**需求与视觉基准**，已据此实现为上面的 Taro + FastAPI 工程。原型本身仅供参考，不参与构建。
