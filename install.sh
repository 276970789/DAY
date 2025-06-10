#!/bin/bash

# PlanFlow Electron版本安装脚本

echo "🚀 PlanFlow Electron版本安装脚本"
echo "=================================="

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到Node.js，请先安装Node.js (https://nodejs.org/)"
    exit 1
fi

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到npm，请确保Node.js安装正确"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ npm版本: $(npm --version)"
echo ""

# 安装依赖
echo "📦 正在安装项目依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功!"
else
    echo "❌ 依赖安装失败，请检查网络连接"
    exit 1
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "📋 可用命令:"
echo "  npm start        - 启动应用"
echo "  npm run dev      - 开发模式启动"
echo "  npm run build    - 构建所有平台版本"
echo "  npm run build-mac - 仅构建macOS版本"
echo "  npm run build-win - 仅构建Windows版本"
echo ""
echo "�� 现在可以运行: npm start" 