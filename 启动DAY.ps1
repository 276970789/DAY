# 设置编码
$OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "启动 DAY 日程管理软件"

Write-Host "=============================================
           🗓️ DAY 日程管理软件
              正在启动独立应用...
=============================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js和npm是否已安装
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
if (-not (Test-Path "main.js")) {
    Write-Host "[错误] 找不到 main.js 文件" -ForegroundColor Red
    Write-Host "请确保在DAY项目根目录下运行此脚本" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "[错误] 找不到 package.json 文件" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查依赖是否已安装
if (-not (Test-Path "node_modules")) {
    Write-Host "[信息] 首次运行，正在安装依赖包..." -ForegroundColor Yellow
    Write-Host "这可能需要几分钟时间，请耐心等待..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 依赖安装失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

# 启动Electron应用
Write-Host "[信息] 正在启动 DAY 桌面应用..." -ForegroundColor Green
Write-Host "[提示] 应用将在独立窗口中打开，并添加系统托盘图标" -ForegroundColor Cyan
Write-Host ""

try {
    npm start
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[错误] DAY 启动失败" -ForegroundColor Red
        Write-Host "请检查错误信息并重试" -ForegroundColor Yellow
        Read-Host "按回车键退出"
    }
} catch {
    Write-Host ""
    Write-Host "[错误] 启动过程中发生异常: $_" -ForegroundColor Red
    Read-Host "按回车键退出"
}

exit 0 