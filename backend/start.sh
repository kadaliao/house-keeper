#!/bin/bash
set -e

# 等待数据库准备好
echo "等待数据库启动..."
sleep 5

# 显示当前环境用户
echo "当前系统用户: $(whoami)"
echo "当前环境变量:"
env | grep -E 'DATABASE_URL|POSTGRES|SQL' | sed 's/=.*:.*@/=*****@/g'

# 显示当前使用的数据库URL (屏蔽密码)
if [ -z "$DATABASE_URL" ]; then
  echo "警告: DATABASE_URL 环境变量未设置!"
else
  echo "使用的数据库URL: ${DATABASE_URL//:*@/:*****@}"
fi

# 确保使用正确的数据库URL
# 优先使用环境变量中设置的，避免使用.env中可能不适合容器环境的配置
export SQLALCHEMY_DATABASE_URI=$DATABASE_URL

# 尝试连接数据库
echo "测试数据库连接..."
RETRIES=5
until psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "等待数据库连接，还剩 $RETRIES 次重试..."
  RETRIES=$((RETRIES-1))
  sleep 5
done

if [ $RETRIES -eq 0 ]; then
  echo "无法连接到数据库，请检查数据库配置和日志"
  echo "尝试以PostgreSQL默认用户连接:"
  PGPASSWORD=postgres psql -h db -U postgres -d house_keeper -c "SELECT 1" || echo "连接失败!"
  exit 1
fi

echo "数据库连接成功!"

# 应用数据库迁移
echo "应用数据库迁移..."
# 明确指定数据库URL
alembic -x database_url=$DATABASE_URL upgrade head || {
  echo "迁移失败，可能是数据库权限问题"
  echo "尝试创建root用户..."
  PGPASSWORD=postgres psql -h db -U postgres -d house_keeper -c "CREATE USER root WITH PASSWORD 'postgres' SUPERUSER;" || echo "创建用户失败，可能已存在"
  echo "重新尝试迁移..."
  alembic -x database_url=$DATABASE_URL upgrade head
}

# 启动应用
echo "启动应用..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
