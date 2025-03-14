# 家庭物品管理系统 (House Keeper)

家庭物品管理系统是一个用于跟踪、管理和组织家庭物品的应用程序。它允许用户记录物品的位置、类型、提醒事项等信息，帮助用户更好地管理家庭物品。

## 功能特点

- 用户认证：注册、登录、个人资料管理
- 物品管理：添加、编辑、删除、查看物品列表，支持图片上传
- 位置管理：创建分层的位置结构，方便物品归类，支持图片上传
- 提醒管理：设置与物品相关的提醒，支持重复提醒，到期和即将到期提醒显示
- 统计分析：物品分类分布、位置物品分布、趋势图、热门位置统计等
- 全局搜索：从任何页面都可以快速搜索物品和位置
- 夜间模式：支持深色/浅色主题切换

## 技术栈

### 后端

- FastAPI：高性能的Python Web框架
- SQLAlchemy：ORM工具
- PostgreSQL：关系型数据库
- JWT：用户认证
- Alembic：数据库迁移

### 前端

- React：前端框架
- Material-UI：UI组件库
- React Router：路由管理
- Axios：HTTP客户端
- Recharts：图表库
- Formik & Yup：表单处理和验证

### 容器化

- Docker：容器化工具
- Docker Compose：多容器应用管理
- Nginx：前端服务器，处理静态资源和API代理

## 快速开始

### 使用Docker（推荐）

项目完全容器化，可以使用Docker Compose轻松启动整个应用：

1. 克隆仓库
   ```
   git clone https://github.com/yourusername/house-keeper.git
   cd house-keeper
   ```

2. 创建环境变量文件
   ```
   cp .env.prod.example .env
   ```
   
3. 启动开发环境
   ```
   docker-compose up -d
   ```

4. 访问应用
   - 前端: http://localhost:3000
   - 后端API: http://localhost:8000/api/v1
   - API文档: http://localhost:8000/docs
   - 数据库管理界面: http://localhost:5050 (用户名: admin@admin.com, 密码: admin)

### 本地开发

如果您不想使用Docker，可以在本地设置开发环境。详细步骤请参阅 [docs/开发指南.md](docs/开发指南.md)。

### 开发助手脚本

项目提供了多个开发辅助脚本：

- 数据库填充脚本: `./scripts/seed_database.sh`（生成测试数据）
- 测试运行脚本: `./scripts/run_tests.sh`（运行单元测试）
- 前端构建脚本: `./scripts/build-frontend.sh`（优化构建前端项目）

有关这些脚本的详细用法，请参阅 [docs/开发指南.md](docs/开发指南.md)。

## 项目结构

项目采用前后端分离的架构，后端提供RESTful API，前端通过API进行数据交互。

- `backend/`：后端代码
  - `app/`：应用代码
    - `api/`：API路由
    - `core/`：核心功能
    - `crud/`：数据库操作
    - `db/`：数据库配置
    - `models/`：数据库模型
    - `schemas/`：Pydantic模型
  - `alembic/`：数据库迁移
  - `tests/`：单元测试和功能测试

- `frontend/`：前端代码
  - `src/`：源代码
    - `components/`：React组件
    - `contexts/`：React上下文
    - `pages/`：页面组件
    - `services/`：API服务
    - `utils/`：工具函数

## 容器化开发与测试

项目采用Docker和Docker Compose进行容器化，支持开发、测试和生产环境：

### 环境配置文件

- `docker-compose.yml`：开发环境配置
- `docker-compose.test.yml`：测试环境配置
- `docker-compose.prod.yml`：生产环境配置
- `docker-compose.build.yml`：构建环境配置

有关不同环境的详细使用说明，请参阅 [docs/开发指南.md](docs/开发指南.md)。

## 文档

- [开发指南](docs/开发指南.md)：详细的开发环境设置、工作流程和最佳实践
- [开发路线图](docs/开发路线图.md)：项目开发计划和未来功能
- [网站目录结构](docs/网站目录结构.md)：详细的项目结构说明
- [项目代码架构设计](docs/项目代码架构设计.md)：系统架构和设计决策

## 测试

项目采用测试驱动开发方法，包括单元测试和集成测试，确保代码质量和可靠性。

### 运行测试

```bash
# 运行后端测试
./scripts/run_tests.sh

# 生成测试覆盖率报告
./scripts/run_tests.sh --coverage

# 运行前端测试
docker-compose exec frontend npm run test
```

测试覆盖率报告位于`backend/htmlcov`目录，可以通过浏览器查看。

### 开发状态

项目当前处于MVP阶段，基础功能已经完成。已实现的功能包括：
- 用户认证：注册、登录、个人资料管理
- 物品管理：添加、编辑、删除、查看物品列表，支持图片上传和多类别筛选
- 位置管理：创建分层的位置结构，支持图片上传和卡片视图
- 提醒管理：设置与物品相关的提醒，支持重复提醒，到期和即将到期提醒显示
- 统计分析：物品分类分布、位置物品分布、趋势图、热门位置统计等，显示真实数据
- 全局搜索：从任何页面都可以快速搜索物品和位置
- 夜间模式：支持深色/浅色主题切换

正在进行测试覆盖率提高和用户文档编写工作。详细开发路线图请参阅[开发路线图](docs/开发路线图.md)。

## 许可证

MIT
