# 基础镜像
FROM python:3.11-slim as base

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 开发环境镜像
FROM base as development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# 生产环境镜像
FROM base as production
# 使用非root用户运行
RUN adduser --disabled-password --gecos "" appuser
USER appuser
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 