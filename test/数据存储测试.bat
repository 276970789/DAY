@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo.
echo 🔧 DAY 数据存储完整性测试
echo ================================
echo.

set "PROJECT_DIR=%~dp0.."
set "TEST_RESULTS=测试结果.txt"

cd /d "%PROJECT_DIR%"

echo [%date% %time%] 开始数据存储测试 > "%TEST_RESULTS%"
echo.

:: 检查项目结构
echo 📁 检查项目结构...
if not exist "main.js" (
    echo ❌ 缺少 main.js 文件
    echo [ERROR] 缺少 main.js 文件 >> "%TEST_RESULTS%"
    goto :error
)

if not exist "renderer-simple.html" (
    echo ❌ 缺少 renderer-simple.html 文件
    echo [ERROR] 缺少 renderer-simple.html 文件 >> "%TEST_RESULTS%"
    goto :error
)

if not exist "preload.js" (
    echo ❌ 缺少 preload.js 文件
    echo [ERROR] 缺少 preload.js 文件 >> "%TEST_RESULTS%"
    goto :error
)

echo ✅ 项目结构检查通过
echo [SUCCESS] 项目结构检查通过 >> "%TEST_RESULTS%"
echo.

:: 检查Node.js环境
echo 🟢 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装或不可用
    echo [ERROR] Node.js 未安装或不可用 >> "%TEST_RESULTS%"
    goto :error
) else (
    for /f "tokens=*" %%v in ('node --version') do (
        echo ✅ Node.js 版本: %%v
        echo [SUCCESS] Node.js 版本: %%v >> "%TEST_RESULTS%"
    )
)

:: 检查依赖包
echo 📦 检查依赖包...
if not exist "node_modules" (
    echo ⚠️  node_modules 不存在，尝试安装依赖...
    echo [WARNING] node_modules 不存在，尝试安装依赖 >> "%TEST_RESULTS%"
    
    echo 正在安装依赖包...
    npm install
    
    if errorlevel 1 (
        echo ❌ 依赖包安装失败
        echo [ERROR] 依赖包安装失败 >> "%TEST_RESULTS%"
        goto :error
    ) else (
        echo ✅ 依赖包安装成功
        echo [SUCCESS] 依赖包安装成功 >> "%TEST_RESULTS%"
    )
) else (
    echo ✅ 依赖包已存在
    echo [SUCCESS] 依赖包已存在 >> "%TEST_RESULTS%"
)
echo.

:: 创建测试数据文件
echo 💾 创建测试配置...
echo.
echo // 数据存储测试配置 > test-config.json
echo {
echo   "testData": {
echo     "tasks": [
echo       {
echo         "id": "test-task-1",
echo         "title": "测试任务1",
echo         "description": "数据存储测试任务",
echo         "status": "pending",
echo         "dueDate": "%date%",
echo         "created": "%date% %time%"
echo       },
echo       {
echo         "id": "test-task-2", 
echo         "title": "测试任务2",
echo         "description": "另一个测试任务",
echo         "status": "completed",
echo         "dueDate": null,
echo         "created": "%date% %time%"
echo       }
echo     ],
echo     "projects": [
echo       {
echo         "id": "test-project-1",
echo         "title": "测试项目",
echo         "description": "用于测试数据存储的项目",
echo         "created": "%date% %time%"
echo       }
echo     ],
echo     "diaries": [
echo       {
echo         "id": "test-diary-1",
echo         "title": "测试日记",
echo         "content": "今天进行了数据存储测试，一切正常。",
echo         "date": "%date%",
echo         "mood": "happy",
echo         "weather": "sunny",
echo         "created": "%date% %time%"
echo       }
echo     ],
echo     "theme": "blue"
echo   },
echo   "testInfo": {
echo     "created": "%date% %time%",
echo     "version": "1.0.0"
echo   }
echo } >> test-config.json

echo ✅ 测试配置文件已创建
echo [SUCCESS] 测试配置文件已创建 >> "%TEST_RESULTS%"
echo.

:: 启动应用并等待用户测试
echo 🚀 启动应用进行数据存储测试...
echo.
echo ⚠️  注意事项：
echo    1. 应用启动后，请添加一些测试数据（任务、项目、日记）
echo    2. 完全关闭应用后，重新启动验证数据是否保存
echo    3. 检查是否有数据丢失问题
echo    4. 如有问题，请查看控制台输出和错误信息
echo.
echo [INFO] 启动应用进行数据存储测试 >> "%TEST_RESULTS%"

pause
echo.
echo 正在启动 DAY 应用...

:: 启动应用（后台模式，显示控制台输出）
start "DAY应用" cmd /c "npm start"

echo.
echo 📋 测试步骤：
echo.
echo 1️⃣  等待应用完全加载
echo 2️⃣  添加一些测试数据：
echo    - 创建几个任务
echo    - 创建一个项目
echo    - 写一篇日记
echo 3️⃣  完全关闭应用（不要最小化到托盘）
echo 4️⃣  重新启动应用
echo 5️⃣  检查数据是否完整保存
echo.
echo 请按任意键继续测试流程...
pause >nul
echo.

:: 等待用户测试
echo ⏳ 请完成上述测试步骤，然后回到这里...
echo.
echo 测试完成后，请选择：
echo   1 - 数据保存正常，没有丢失
echo   2 - 数据有丢失或不一致问题
echo   3 - 应用启动失败或其他错误
echo.
set /p "choice=请选择 (1-3): "

if "%choice%"=="1" (
    echo.
    echo ✅ 数据存储测试通过！
    echo [SUCCESS] 用户确认数据存储正常 >> "%TEST_RESULTS%"
    goto :success
)

if "%choice%"=="2" (
    echo.
    echo ❌ 发现数据存储问题！
    echo.
    echo 📋 请提供以下信息：
    set /p "issue=请描述具体问题: "
    echo [ERROR] 数据存储问题: !issue! >> "%TEST_RESULTS%"
    echo.
    echo 🔧 尝试修复措施：
    echo    1. 检查数据文件位置
    echo    2. 创建备份机制
    echo    3. 添加数据验证
    goto :fix_attempt
)

if "%choice%"=="3" (
    echo.
    echo ❌ 应用启动或运行异常！
    echo.
    echo 📋 请提供错误信息：
    set /p "error=请描述错误: "
    echo [ERROR] 应用异常: !error! >> "%TEST_RESULTS%"
    goto :error
)

echo ❌ 无效选择，请重新运行测试
goto :error

:fix_attempt
echo.
echo 🛠️  开始修复尝试...
echo.

:: 检查数据文件路径
echo 📍 检查数据存储位置...
echo 用户数据目录通常在：
echo   Windows: %%APPDATA%%\day-app\
echo   或: %%USERPROFILE%%\AppData\Roaming\day-app\
echo.

:: 提供诊断工具
echo 🔧 生成诊断脚本...
echo.
echo // 数据存储诊断 > 诊断工具.js
echo const path = require('path'^);
echo const fs = require('fs'^);
echo const os = require('os'^);
echo.
echo console.log('=== DAY 数据存储诊断 ==='^);
echo console.log('操作系统:', os.platform(^)^);
echo console.log('用户目录:', os.homedir(^)^);
echo.
echo // 可能的数据存储位置
echo const possiblePaths = [
echo   path.join(os.homedir(^), 'AppData', 'Roaming', 'day-app', 'day-data.json'^),
echo   path.join(os.homedir(^), '.config', 'day-app', 'day-data.json'^),
echo   path.join(__dirname, 'day-data.json'^),
echo   path.join(__dirname, 'data', 'day-data.json'^)
echo ];
echo.
echo console.log('\\n检查可能的数据文件位置:'^);
echo possiblePaths.forEach(p =^> {
echo   if (fs.existsSync(p^)^) {
echo     console.log('✅ 找到:', p^);
echo     try {
echo       const data = JSON.parse(fs.readFileSync(p, 'utf8'^)^);
echo       console.log('   数据量:', Object.keys(data^).length^);
echo       if (data.tasks^) console.log('   任务数:', data.tasks.length^);
echo       if (data.projects^) console.log('   项目数:', data.projects.length^);
echo       if (data.diaries^) console.log('   日记数:', data.diaries.length^);
echo     } catch (e^) {
echo       console.log('   ❌ 文件损坏:', e.message^);
echo     }
echo   } else {
echo     console.log('❌ 不存在:', p^);
echo   }
echo }^);
echo. >> 诊断工具.js

echo ✅ 诊断工具已创建
echo.
echo 运行诊断工具？ (y/n):
set /p "run_diag=>"

if /i "%run_diag%"=="y" (
    echo.
    echo 🔍 运行诊断...
    node 诊断工具.js
    echo.
    echo 诊断完成！
    echo [INFO] 运行了数据诊断工具 >> "%TEST_RESULTS%"
)

echo.
echo 📋 修复建议：
echo    1. 统一数据存储机制
echo    2. 添加数据备份功能  
echo    3. 实现数据验证检查
echo    4. 创建数据恢复工具
echo.
echo [INFO] 已提供修复建议 >> "%TEST_RESULTS%"

goto :end

:success
echo.
echo 🎉 数据存储测试成功完成！
echo.
echo 📊 测试总结：
echo    ✅ 项目结构正确
echo    ✅ 依赖包完整
echo    ✅ 应用启动正常
echo    ✅ 数据保存可靠
echo    ✅ 数据加载正确
echo.
echo 建议：
echo    📅 定期备份数据
echo    🔄 定期验证数据完整性
echo    🛡️  考虑添加数据校验机制
echo.
goto :end

:error
echo.
echo ❌ 测试失败或发现问题！
echo.
echo 请查看 "%TEST_RESULTS%" 文件了解详细信息
echo.
echo 🔧 可能的解决方案：
echo    1. 重新安装依赖包: npm install
echo    2. 检查 Node.js 版本兼容性
echo    3. 确认文件权限正确
echo    4. 查看应用控制台错误信息
echo.

:end
echo.
echo [%date% %time%] 测试结束 >> "%TEST_RESULTS%"
echo.
echo 测试结果已保存到: %TEST_RESULTS%
echo.
echo 按任意键退出...
pause >nul

:: 清理临时文件
if exist "test-config.json" del "test-config.json"
if exist "诊断工具.js" del "诊断工具.js" 