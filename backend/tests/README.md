# 测试说明

本项目使用 pytest 和 Docker Compose 进行测试，支持多种测试环境配置。

## 测试环境

项目支持两种测试环境：

1. **SQLite 内存数据库**：适用于简单的单元测试和快速验证
2. **PostgreSQL 测试数据库**：通过 Docker Compose 创建，适用于集成测试和 API 测试

## 运行测试

### 使用 Docker Compose 的 PostgreSQL 测试（推荐）

使用项目根目录中的脚本启动测试环境并运行测试：

```bash
./scripts/run_tests.sh
```

这个脚本会：
1. 启动专用的 PostgreSQL 测试数据库容器
2. 构建并运行后端测试容器
3. 执行所有测试
4. 清理测试环境

### 直接运行测试（使用 SQLite）

如果只想在本地快速运行测试，可以直接使用：

```bash
cd backend
python -m pytest
```

这将使用 SQLite 内存数据库作为测试数据库。

## 测试配置

测试配置位于 `conftest.py` 文件中，通过环境变量可以控制测试行为：

- **TEST_DATABASE_URL**：测试数据库的连接 URL，如果未设置则使用 SQLite
- **TESTING**：设置为 True 表示处于测试环境

## 编写测试

在编写测试时请注意：

1. 所有 API 测试应放在 `tests/api/` 目录下
2. 所有单元测试应放在 `tests/unit/` 目录下
3. 对于异步操作的测试，使用 `@pytest.mark.asyncio` 装饰器
4. 使用 `setup_method` 和 `teardown_method` 来管理测试环境
5. 导入所有必要的模型以确保表创建

## 调试测试

如果测试失败，可以检查：

1. 确保 PostgreSQL 容器已经启动并健康
2. 查看测试日志，了解表创建情况
3. 检查依赖项是否正确安装
4. 确保测试环境与应用环境一致 