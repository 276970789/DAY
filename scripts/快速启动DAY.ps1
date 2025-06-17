# DAY 任务管理应用 - PowerShell 快速启动脚本
# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "DAY 任务管理 - 快速启动"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DAY 任务管理应用 - 快速启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js是否安装
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "[信息] Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

# 切换到应用目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$appPath = Split-Path -Parent $scriptPath
Set-Location $appPath

Write-Host "[信息] 应用目录: $appPath" -ForegroundColor Green

# 检查依赖是否安装
if (-not (Test-Path "node_modules")) {
    Write-Host "[信息] 正在安装依赖包..." -ForegroundColor Yellow
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-Host "[成功] 依赖安装完成" -ForegroundColor Green
    } catch {
        Write-Host "[错误] 依赖安装失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
} else {
    Write-Host "[信息] 依赖已安装" -ForegroundColor Green
}

# 显示快捷键提示
Write-Host ""
Write-Host "🚀 全局快捷键:" -ForegroundColor Magenta
Write-Host "   • Ctrl+Shift+D : 快速唤出/隐藏DAY应用" -ForegroundColor White
Write-Host "   • Ctrl+Alt+D   : 备选快捷键" -ForegroundColor White
Write-Host ""

# 启动应用
Write-Host "[信息] 正在启动DAY应用..." -ForegroundColor Yellow
try {
    npm start
} catch {
    Write-Host ""
    Write-Host "[错误] 应用启动失败或异常退出" -ForegroundColor Red
    Write-Host "请检查错误信息并重试" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按回车键退出"
} 