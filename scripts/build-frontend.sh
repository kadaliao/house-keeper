#!/bin/bash

echo "开始优化构建前端..."

# 确保脚本能够捕获错误并退出
set -e

# 清理旧的构建产物
echo "清理旧的构建产物..."
rm -rf ./frontend/build 2>/dev/null || true

# 清理Docker缓存释放空间
echo "清理Docker缓存..."
docker system prune -f

# 直接在本地构建
echo "开始构建前端应用..."
cd frontend

# 设置环境变量，增加Node内存
export NODE_OPTIONS="--max-old-space-size=4096"
export REACT_APP_API_URL=${API_URL:-http://localhost:8000/api/v1}

# 安装依赖
echo "安装依赖..."
npm ci --prefer-offline --no-audit || npm install

# 构建应用
echo "构建应用..."
npm run build

echo "前端构建完成！"
echo "构建产物位于: ./frontend/build"

# 返回到项目根目录
cd .. 