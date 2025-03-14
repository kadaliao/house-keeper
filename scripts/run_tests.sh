#!/bin/bash
set -e

# 输出颜色设置
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}正在启动测试环境...${NC}"

# 停止之前可能运行的测试容器
docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true

# 创建覆盖率报告目录
mkdir -p backend/coverage_reports

# 启动测试数据库和后端测试容器
echo -e "${YELLOW}启动 PostgreSQL 测试数据库...${NC}"
docker-compose -f docker-compose.test.yml up -d test-db

# 等待数据库启动完成
echo -e "${YELLOW}等待测试数据库准备就绪...${NC}"
sleep 5  # 简单等待，也可以使用更复杂的健康检查

# 构建后端测试镜像
echo -e "${YELLOW}构建测试环境...${NC}"
docker-compose -f docker-compose.test.yml build backend-test

# 运行测试
echo -e "${GREEN}运行测试...${NC}"
docker-compose -f docker-compose.test.yml run --rm backend-test

# 测试完成后显示报告位置
echo -e "${GREEN}测试和覆盖率分析完成！${NC}"
echo -e "${YELLOW}HTML覆盖率报告已生成在: backend/coverage_reports/${NC}"

# 清理环境
echo -e "${YELLOW}清理测试环境...${NC}"
docker-compose -f docker-compose.test.yml down -v

echo -e "${GREEN}测试完成！${NC}" 