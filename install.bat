@echo off
chcp 65001 >nul
echo ========================================
echo    PlanFlow 智能日程管理软件安装脚本
echo ========================================
echo.

echo [1/4] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js环境检查通过
)

echo.
echo [2/4] 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
) else (
    echo ✅ 依赖安装成功
)

echo.
echo [3/4] 检查应用程序...
if not exist "main.js" (
    echo ❌ 主程序文件不存在
    pause
    exit /b 1
) else (
    echo ✅ 应用程序文件检查通过
)

echo.
echo [4/4] 启动应用程序...
echo 正在启动PlanFlow...
echo.
echo 💡 提示：
echo - 应用会在新窗口中打开
echo - 关闭窗口时会最小化到系统托盘
echo - 使用Ctrl+Q完全退出应用
echo.

start "" npm start

echo ✅ 安装完成！PlanFlow正在启动...
echo.
echo 如需帮助，请查看：
echo - 测试指南.md
echo - Electron版本说明.md
echo.
pause 