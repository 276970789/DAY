@echo off
chcp 65001 > nul
title 启动 DAY 日程管理软件

echo =============================================
echo           🗓️ DAY 日程管理软件
echo              正在启动独立应用...
echo =============================================
echo.

:: 检查Node.js和npm是否已安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查必要文件
if not exist "main.js" (
    echo [错误] 找不到 main.js 文件
    echo 请确保在DAY项目根目录下运行此脚本
    pause
    exit /b 1
)

if not exist "package.json" (
    echo [错误] 找不到 package.json 文件
    pause
    exit /b 1
)

:: 检查依赖是否已安装
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖包...
    echo 这可能需要几分钟时间，请耐心等待...
    npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

:: 启动Electron应用
echo [信息] 正在启动 DAY 桌面应用...
echo [提示] 应用将在独立窗口中打开，并添加系统托盘图标
echo.

npm start

:: 如果启动失败，显示错误信息
if %errorlevel% neq 0 (
    echo.
    echo [错误] DAY 启动失败
    echo 请检查错误信息并重试
    pause
)

exit /b 0 