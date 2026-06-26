# 投小AI · AInvy — Frontend (Taro · React + TS)

投顾小助手前端，用 [Taro](https://taro.zone) 编写，一套代码同时编译到 **微信小程序** 与 **H5**。

像素级还原 Claude Design 原型的「墨绿 + 古铜金」编辑感简报风格。

## 页面与功能

单页有状态应用（`src/pages/index/index.tsx`），与原型 `app-v2.jsx` 一一对应：

- **简报** — 顶部 AI 一段话总结 + 要点 → 板块热度榜 → 动态信息流（部分卡片可展开 AI 解读）
- **优选** — 高/中/低风险组合推荐 + 按主题精选；进详情看净值走势 + 定投计算器
- **持仓** — 模拟持仓（市值/盈亏）与自选两个子 Tab
- **消息** — 订阅消息通知列表
- **投喂分析**（底部中间金色 FAB）— 投喂文字 → 调后端 `/api/analyze` → 概念/情绪/可投标的/风险

底部是带中间 FAB 的**自绘 TabBar**（原生 tabBar 无法实现这种造型）。

## 与后端的关系

所有数据来自 FastAPI 后端（见 `../backend`）。后端地址通过构建期变量 `TARO_APP_API` 注入，默认 `http://localhost:8000`：

```bash
TARO_APP_API=https://your-api.com npm run build:h5
```

> 微信小程序需在「request 合法域名」白名单中加入该后端域名（小程序不直接调第三方源，统一走自建后端）。

## 运行

```bash
cd frontend
npm install

# H5（浏览器，最容易预览）
npm run build:h5          # 产物在 dist/，含 index.html
npm run dev:h5            # watch 模式

# 微信小程序
npm run build:weapp       # 产物在 dist/，用微信开发者工具打开本目录
npm run dev:weapp
```

H5 本地预览（配合后端）：

```bash
# 1) 启动后端
cd ../backend && APP_ENV=dev uvicorn app.main:app --port 8000
# 2) 构建并起静态服务
cd ../frontend && npm run build:h5
cd dist && python3 -m http.server 10086
# 打开 http://localhost:10086/index.html
```

## 跨端实现要点

- **尺寸**：`utils/size.ts` 的 `r(px)` —— 小程序输出 `rpx`（按 750 设计宽自适应），H5 输出固定 `px`（置于居中手机列，像素还原原型）。
- **图标**：用自带的 base64 图标字体（`appicon`），由 `<Text class="appicon">` 渲染、CSS `color` 改色，H5 与小程序均可靠（不依赖 `<Image>` 对 SVG 的支持）。字体由 `tools/build_iconfont.py` 从线性图标 SVG 生成，产物为 `src/assets/iconfont.gen.scss`（@font-face 内嵌 base64 woff2）与 `src/components/iconfont.gen.ts`（名称→码位映射）；改图标后重跑该脚本即可。`fill` 选实心字形（star / bell / flame / bookmark / sparkle / bolt）。
- **迷你走势图**：`Sparkline` 仍把数据折线转成 `data:image/svg+xml;base64` 由 `<Image>` 渲染（H5 已验证；小程序如遇老基础库不渲染，可改用 `<Canvas>`）。
- **字体**：H5 通过 Google Fonts 加载 Noto Serif/Sans SC（早报衬线感）；小程序无法直接加载外部字体，回退系统衬线（如需可用 `wx.loadFontFace`）。
- **主题**：`theme/index.ts` 含墨绿金 / 深蓝 / 中性墨三套；默认墨绿金，改 `pages/index/index.tsx` 顶部 `THEME_KEY` 即可切换。

## 结构

```
src/
  app.{tsx,scss,config.ts}   # 入口 / 全局样式 / 路由与窗口配置
  index.html                 # H5 模板（Taro 据此生成 dist/index.html）
  pages/index/               # 单页主容器：状态、导航、弹层、API 装配
  screens/                   # 五个屏 + 详情/弹层（HomeScreen/FundsScreen/...）
  components/                # Icon / Sparkline / TabBar / Frame / atoms / Toast
  services/                  # api.ts（Taro.request 封装）+ types.ts（与后端契约一致）
  theme/                     # 配色 token
  utils/                     # size(r) / format / svg
  assets/iconfont.gen.scss   # 生成：图标字体 @font-face（base64 woff2）
tools/
  build_iconfont.py          # 由 SVG 生成图标字体（需 fonttools / shapely）
  verify_iconfont.mjs        # 字体字形 vs 原始 SVG 视觉比对（需 playwright-core）
```
