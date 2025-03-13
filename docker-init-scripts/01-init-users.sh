#!/bin/bash
set -e

# 创建root数据库和root用户并授予必要权限
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE root;
  CREATE USER root WITH PASSWORD 'postgres' SUPERUSER;
  GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO root;
  GRANT ALL PRIVILEGES ON DATABASE root TO root;
  GRANT ALL PRIVILEGES ON SCHEMA public TO root;
EOSQL

echo "创建root用户和root数据库成功" 