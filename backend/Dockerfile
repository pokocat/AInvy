# 投小AI · AInvy 后端 — 微信云托管 (WeChat Cloud Hosting)
#
# 构建上下文 = backend/（云托管「目标目录」填 backend），所以下面所有 COPY 的
# 路径都相对 backend/。容器监听 80，与控制台「端口」一致。
FROM python:3.12-slim

# 云托管在国内构建：把 pip 指到腾讯云镜像，避免拉 PyPI 超时。
RUN pip config set global.index-url https://mirrors.cloud.tencent.com/pypi/simple/

WORKDIR /app

# 先装依赖，利用镜像层缓存（requirements 不变就不重装）。
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 应用代码。
COPY app ./app

# 默认 dev=离线 mock，首次部署零密钥即可起来。需要真实行情时在云托管
# 「环境变量」里设 APP_ENV=prod（并按 .env.example 填 LLM_API_KEY 等）。
ENV APP_ENV=dev
EXPOSE 80
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
