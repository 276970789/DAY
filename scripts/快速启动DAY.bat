@echo off
chcp 65001 >nul
title DAY 任务管理 - 快速启动

echo.
echo ========================================
echo    DAY 任务管理应用 - 快速启动
echo ========================================
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 切换到应用目录
cd /d "%~dp0.."

:: 检查依赖是否安装
if not exist "node_modules" (
    echo [信息] 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

:: 启动应用
echo [信息] 正在启动DAY应用...
echo [提示] 全局快捷键: Ctrl+Shift+D 或 Ctrl+Alt+D
echo.
npm start

:: 如果应用异常退出，显示错误信息
if errorlevel 1 (
    echo.
    echo [错误] 应用启动失败或异常退出
    echo 请检查错误信息并重试
    echo.
    pause
) 