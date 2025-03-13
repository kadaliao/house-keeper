#!/bin/bash
# 家庭物品管理系统 - 数据库填充脚本

set -e

# 脚本帮助信息
show_help() {
    echo "家庭物品管理系统 - 数据库填充脚本"
    echo ""
    echo "此脚本用于填充开发环境的测试数据。"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help       显示帮助信息"
    echo "  -d, --docker     在Docker容器中执行（默认）"
    echo "  -l, --local      在本地环境执行"
    echo ""
    echo "示例:"
    echo "  $0                  # 默认在Docker容器中执行"
    echo "  $0 --local          # 在本地环境执行"
}

# 默认选项
RUN_MODE="docker"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--docker)
            RUN_MODE="docker"
            shift
            ;;
        -l|--local)
            RUN_MODE="local"
            shift
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

echo "=== 家庭物品管理系统 - 数据库填充脚本 ==="
echo "运行模式: $RUN_MODE"

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ "$RUN_MODE" = "docker" ]; then
    # 检查Docker容器是否运行，使用部分匹配
    BACKEND_CONTAINER=$(docker ps | grep "house-keeper-backend" | awk '{print $NF}' | head -n 1)
    
    if [ -z "$BACKEND_CONTAINER" ]; then
        echo "错误: 未找到后端Docker容器，请先启动容器"
        echo "可以使用 'docker compose up -d' 启动容器"
        exit 1
    fi
    
    echo "在Docker容器 '$BACKEND_CONTAINER' 中执行数据填充..."
    docker exec $BACKEND_CONTAINER python app/utils/seed_db.py
else
    # 本地环境执行
    echo "在本地环境执行数据填充..."
    cd "$PROJECT_ROOT/backend"
    
    # 检查虚拟环境是否存在
    if [ ! -d "venv" ]; then
        echo "错误: 虚拟环境不存在，请先创建虚拟环境"
        echo "可以使用 'python -m venv venv' 创建虚拟环境"
        exit 1
    fi
    
    # 激活虚拟环境
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    else
        echo "错误: 无法找到虚拟环境激活脚本"
        exit 1
    fi
    
    # 执行数据库填充脚本
    python app/utils/seed_db.py
    
    # 停用虚拟环境
    deactivate
fi

echo "数据库填充完成!" 