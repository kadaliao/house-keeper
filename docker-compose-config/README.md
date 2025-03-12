# Docker Compose 配置结构

本项目使用模块化的 Docker Compose 配置结构，将不同环境的配置分离，减少重复代码，提高可维护性。

## 配置文件结构

- **base.yml**: 基础配置文件，包含所有环境共享的服务定义和网络配置
- **dev.yml**: 开发环境配置，扩展基础配置，添加开发特定的设置
- **test.yml**: 测试环境配置，用于运行自动化测试
- **prod.yml**: 生产环境配置，包含资源限制和生产特定的设置
- **build.yml**: 前端构建优化配置，提供更多资源用于构建过程

## 主要入口文件

项目根目录中的 Docker Compose 文件作为入口点，通过 `include` 指令引用配置目录中的文件：

- **docker-compose.yml**: 开发环境入口，引用 base.yml 和 dev.yml
- **docker-compose.test.yml**: 测试环境入口，引用 base.yml 和 test.yml
- **docker-compose.prod.yml**: 生产环境入口，引用 base.yml 和 prod.yml
- **docker-compose.build.yml**: 构建优化入口，引用 base.yml 和 build.yml

## 使用方法

### 开发环境

```bash
docker-compose up
```

### 测试环境

```bash
docker-compose -f docker-compose.test.yml up
```

### 生产环境

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 前端构建优化

```bash
docker-compose -f docker-compose.build.yml up
```

## 扩展和修改

如需修改配置，请遵循以下原则：

1. 通用配置放在 base.yml 中
2. 环境特定配置放在对应的环境文件中
3. 保持入口文件简洁，仅包含 include 指令
4. 修改后确保所有环境都能正常工作 