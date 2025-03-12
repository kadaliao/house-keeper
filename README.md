# 家庭物品管理系统 (House Keeper)

家庭物品管理系统是一个用于跟踪、管理和组织家庭物品的应用程序。它允许用户记录物品的位置、类型、提醒事项等信息，帮助用户更好地管理家庭物品。

## 功能特点

- 用户认证：注册、登录、个人资料管理
- 物品管理：添加、编辑、删除、查看物品列表
- 位置管理：创建分层的位置结构，方便物品归类
- 提醒管理：设置与物品相关的提醒，支持重复提醒
- 统计分析：物品分类分布、位置物品分布等统计信息

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

2. 启动开发环境
   ```
   docker-compose up
   ```

3. 访问应用
   - 前端: http://localhost:3000
   - 后端API: http://localhost:8000/api/v1
   - API文档: http://localhost:8000/docs
   - 数据库管理界面: http://localhost:5050 (用户名: admin@admin.com, 密码: admin)

### 本地开发（无Docker）

如果您不想使用Docker，也可以在本地设置开发环境：

#### 后端设置

1. 创建并激活虚拟环境
   ```
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate  # Windows
   ```

2. 安装依赖
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. 设置环境变量
   ```
   cp .env.example .env
   # 编辑.env文件，设置数据库连接和密钥
   ```

4. 创建数据库
   ```
   createdb house_keeper  # 如果使用PostgreSQL
   ```

5. 运行数据库迁移
   ```
   alembic upgrade head
   ```

6. 启动后端服务
   ```
   uvicorn app.main:app --reload
   ```

#### 前端设置

1. 安装依赖
   ```
   cd frontend
   npm install
   ```

2. 启动前端开发服务器
   ```
   npm start
   ```

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

### 开发环境

- `docker-compose.yml`：用于开发环境，提供热重载和开发便利性
- 包含服务：backend、frontend、db、pgadmin
- 支持代码修改热重载，便于快速开发

### 测试环境

- `docker-compose.test.yml`：专用于测试环境
- 提供隔离的测试数据库环境，避免污染开发数据
- 运行测试指令：`docker-compose -f docker-compose.test.yml up`

### 生产环境

- `docker-compose.prod.yml`：用于生产部署
- 优化设置：资源限制、健康检查、安全配置
- 部署指令：`docker-compose -f docker-compose.prod.yml up -d`

### 构建优化

- 多阶段构建（Multi-stage builds）提高Docker镜像效率
- 使用`.npmrc`优化前端构建性能
- 提供了专用的构建脚本，简化构建流程

## 开发路线图

请参阅 [docs/开发路线图.md](docs/开发路线图.md) 了解未来开发计划。

## 许可证

MIT
