@echo off
chcp 65001 > nul
title 创建 DAY 桌面快捷方式

echo =============================================
echo         🗓️ DAY 桌面快捷方式创建工具
echo =============================================
echo.

:: 获取当前目录
set "CURRENT_DIR=%cd%"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "SHORTCUT_NAME=DAY 日程管理"

:: 检查必要文件
if not exist "%CURRENT_DIR%\启动DAY.bat" (
    echo [错误] 找不到启动脚本文件
    echo 请确保 启动DAY.bat 文件存在
    pause
    exit /b 1
)

if not exist "%CURRENT_DIR%\assets\图标.png" (
    echo [警告] 找不到图标文件，将使用默认图标
    set "ICON_PATH="
) else (
    set "ICON_PATH=%CURRENT_DIR%\assets\图标.png"
)

echo [信息] 正在创建桌面快捷方式...

:: 使用PowerShell创建快捷方式
powershell -Command ^
"$WshShell = New-Object -comObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('%DESKTOP_DIR%\%SHORTCUT_NAME%.lnk'); ^
$Shortcut.TargetPath = '%CURRENT_DIR%\启动DAY.bat'; ^
$Shortcut.WorkingDirectory = '%CURRENT_DIR%'; ^
$Shortcut.Description = 'DAY 日程管理软件 - 高效的任务与时间管理工具'; ^
$Shortcut.IconLocation = '%CURRENT_DIR%\assets\图标.png'; ^
$Shortcut.WindowStyle = 1; ^
$Shortcut.Save()"

if %errorlevel% equ 0 (
    echo.
    echo ✅ [成功] 桌面快捷方式创建成功！
    echo.
    echo 📍 快捷方式位置: %DESKTOP_DIR%\%SHORTCUT_NAME%.lnk
    echo 🎯 快捷方式名称: %SHORTCUT_NAME%
    echo 🖼️  使用图标: 您的自定义 logo
    echo.
    echo 💡 使用说明:
    echo    • 双击桌面快捷方式即可启动 DAY
    echo    • 应用将在独立窗口中运行
    echo    • 最小化时会保留在系统托盘
    echo    • 所有数据自动保存在本地
    echo.
    
    :: 询问是否立即启动
    set /p choice="是否立即启动 DAY？(Y/N): "
    if /i "%choice%"=="Y" (
        echo [信息] 正在启动 DAY...
        start "" "%CURRENT_DIR%\启动DAY.bat"
    )
) else (
    echo.
    echo ❌ [错误] 快捷方式创建失败
    echo 请检查权限或手动创建快捷方式
)

echo.
echo 按任意键关闭此窗口...
pause > nul 