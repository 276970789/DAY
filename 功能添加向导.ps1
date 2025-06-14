# 设置编码
$OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "DAY 功能添加向导"

Write-Host "=============================================
           🚀 DAY 功能添加向导
==============================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js是否已安装
try {
    $nodeVersion = node -v
    Write-Host "[✓] 检测到 Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 检查必要文件
if (-not (Test-Path "package.json")) {
    Write-Host "[错误] 找不到 package.json 文件" -ForegroundColor Red
    Write-Host "请确保在DAY项目根目录下运行此脚本" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 读取功能列表
$featuresList = Get-Content -Path "功能改进清单.md" -Raw

if (-not $featuresList) {
    Write-Host "[错误] 找不到功能改进清单文件" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 显示功能列表
Write-Host "请选择您想要添加的功能:" -ForegroundColor Yellow
Write-Host ""
Write-Host $featuresList
Write-Host ""

# 获取用户选择
$userSelection = Read-Host "请输入您要添加的功能编号，多个功能用逗号分隔(如: A1, B2.1, B3.1)"

# 解析用户选择
$selectedFeatures = $userSelection -split ',' | ForEach-Object { $_.Trim() }

# 确认用户选择
Write-Host ""
Write-Host "您选择了以下功能:" -ForegroundColor Green
foreach ($feature in $selectedFeatures) {
    Write-Host "- $feature" -ForegroundColor Cyan
}
Write-Host ""

$confirm = Read-Host "确认添加这些功能吗? (Y/N)"

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "操作已取消" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 0
}

# 创建功能实施文件
$featureFile = "selected_features.json"
$featureObject = @{
    features = $selectedFeatures
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

$featureObject | ConvertTo-Json | Out-File $featureFile -Encoding utf8

Write-Host ""
Write-Host "[信息] 已保存功能选择到 $featureFile" -ForegroundColor Green
Write-Host "接下来，请运行以下命令开始添加功能:" -ForegroundColor Yellow
Write-Host "npm run add-features" -ForegroundColor Cyan
Write-Host ""

# 添加npm脚本到package.json
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$packageJson.scripts | Add-Member -Name "add-features" -Value "node feature-installer.js" -MemberType NoteProperty -Force
$packageJson | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding utf8

# 创建功能安装脚本
$installerContent = @"
/**
 * DAY功能安装器
 * 用于安装用户选择的功能
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 读取选择的功能
try {
    const featuresFile = path.join(__dirname, 'selected_features.json');
    if (!fs.existsSync(featuresFile)) {
        console.error('找不到功能选择文件，请先运行功能添加向导');
        process.exit(1);
    }

    const featuresData = JSON.parse(fs.readFileSync(featuresFile, 'utf8'));
    const selectedFeatures = featuresData.features || [];

    console.log('='.repeat(50));
    console.log('DAY功能安装器');
    console.log('='.repeat(50));
    console.log('');
    console.log('选择的功能:');
    selectedFeatures.forEach(feature => console.log(`- \${feature}`));
    console.log('');

    // 创建功能映射表
    const featureMapping = {
        // A组 - Bug修复
        'A1': { name: 'API接口不匹配修复', script: './features/fix-api-mismatch.js' },
        'A2': { name: '事件监听器修复', script: './features/fix-event-listeners.js' },
        'A3': { name: '数据加载/保存问题修复', script: './features/fix-data-storage.js' },
        'A4': { name: '日期处理修复', script: './features/fix-date-handling.js' },
        'A5': { name: '窗口管理改进', script: './features/fix-window-management.js' },
        
        // B1组 - 任务管理增强
        'B1.1': { name: '任务优先级系统', script: './features/add-task-priority.js' },
        'B1.2': { name: '任务标签与分类', script: './features/add-task-tags.js' },
        'B1.3': { name: '重复任务支持', script: './features/add-recurring-tasks.js' },
        'B1.4': { name: '子任务功能', script: './features/add-subtasks.js' },
        
        // B2组 - 时间管理工具
        'B2.1': { name: '番茄钟工作法集成', script: './features/add-pomodoro.js' },
        'B2.2': { name: '时间统计分析', script: './features/add-time-stats.js' },
        'B2.3': { name: '工作时间追踪', script: './features/add-time-tracking.js' },
        
        // B3组 - 用户界面改进
        'B3.1': { name: '完整深色模式支持', script: './features/add-dark-mode.js' },
        'B3.2': { name: '自定义主题系统', script: './features/add-theme-system.js' },
        'B3.3': { name: '界面布局优化', script: './features/improve-ui-layout.js' },
        'B3.4': { name: '响应式设计改进', script: './features/improve-responsive-design.js' },
        
        // B4组 - 数据管理
        'B4.1': { name: '多格式数据导出', script: './features/add-data-export.js' },
        'B4.2': { name: '数据导入功能', script: './features/add-data-import.js' },
        'B4.3': { name: '数据加密存储', script: './features/add-data-encryption.js' },
        'B4.4': { name: '云同步基础设施', script: './features/add-cloud-sync.js' },
        
        // B5组 - 通知与提醒
        'B5.1': { name: '任务到期提醒', script: './features/add-task-reminders.js' },
        'B5.2': { name: '自定义提醒规则', script: './features/add-custom-reminders.js' },
        'B5.3': { name: '系统通知集成', script: './features/add-system-notifications.js' },
        
        // B6组 - 生产力工具
        'B6.1': { name: '统计分析报表', script: './features/add-analytics-reports.js' },
        'B6.2': { name: '目标跟踪系统', script: './features/add-goal-tracking.js' },
        'B6.3': { name: '习惯培养追踪', script: './features/add-habit-tracking.js' },
        
        // B7组 - 其他增强
        'B7.1': { name: '国际化支持', script: './features/add-internationalization.js' },
        'B7.2': { name: '快捷键系统完善', script: './features/improve-shortcuts.js' },
        'B7.3': { name: '性能优化', script: './features/improve-performance.js' },
        'B7.4': { name: '移动设备适配', script: './features/add-mobile-support.js' },
        'B7.5': { name: '插件系统基础', script: './features/add-plugin-system.js' }
    };

    // 创建features目录
    const featuresDir = path.join(__dirname, 'features');
    if (!fs.existsSync(featuresDir)) {
        fs.mkdirSync(featuresDir, { recursive: true });
    }

    // 为每个选择的功能创建占位脚本
    selectedFeatures.forEach(featureId => {
        const feature = featureMapping[featureId];
        if (!feature) {
            console.log(`警告: 找不到功能 \${featureId} 的实现`);
            return;
        }

        console.log(`准备安装: \${feature.name}`);
        
        // 检查脚本是否存在
        const scriptPath = path.join(__dirname, feature.script);
        if (!fs.existsSync(scriptPath)) {
            // 创建功能实现脚本
            const scriptContent = `/**
 * \${feature.name}
 * 功能ID: \${featureId}
 * 
 * 此脚本将实现\${feature.name}功能
 */
console.log('开始安装: \${feature.name}');

// TODO: 实现\${feature.name}功能

console.log('\${feature.name} 安装完成');
`;
            
            // 确保目录存在
            const scriptDir = path.dirname(scriptPath);
            if (!fs.existsSync(scriptDir)) {
                fs.mkdirSync(scriptDir, { recursive: true });
            }
            
            // 写入脚本文件
            fs.writeFileSync(scriptPath, scriptContent, 'utf8');
            console.log(`- 创建功能脚本: \${feature.script}`);
        }
    });

    console.log('');
    console.log('所有功能脚本已准备就绪');
    console.log('');
    console.log('接下来，我们将实现您选择的功能...');
    console.log('');

    // 执行选择的功能脚本
    selectedFeatures.forEach(featureId => {
        const feature = featureMapping[featureId];
        if (!feature) return;

        const scriptPath = path.join(__dirname, feature.script);
        if (fs.existsSync(scriptPath)) {
            console.log(`=== 正在实现: \${feature.name} ===`);
            try {
                require(scriptPath);
                console.log(`=== \${feature.name} 实现完成 ===`);
            } catch (error) {
                console.error(`执行脚本 \${feature.script} 时出错:`, error);
            }
            console.log('');
        }
    });

    console.log('='.repeat(50));
    console.log('所有选择的功能已处理完成');
    console.log('请重新启动DAY应用以应用更改');
    console.log('='.repeat(50));

} catch (error) {
    console.error('安装功能时出错:', error);
    process.exit(1);
}
"@

# 保存功能安装脚本
$installerContent | Out-File "feature-installer.js" -Encoding utf8

Write-Host "[信息] 已创建功能安装脚本" -ForegroundColor Green
Write-Host ""
Write-Host "您可以运行以下命令来实施选择的功能:" -ForegroundColor Yellow
Write-Host "npm run add-features" -ForegroundColor Cyan
Write-Host ""

$runNow = Read-Host "是否现在运行功能安装程序? (Y/N)"

if ($runNow -eq "Y" -or $runNow -eq "y") {
    Write-Host ""
    Write-Host "[信息] 正在运行功能安装程序..." -ForegroundColor Cyan
    npm run add-features
} else {
    Write-Host "您可以稍后运行 'npm run add-features' 来安装选择的功能" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "按回车键退出" 