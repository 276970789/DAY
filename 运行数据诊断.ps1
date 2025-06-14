# 设置编码
$OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "DAY 数据诊断工具"

Write-Host "=============================================
           🔍 DAY 数据诊断工具
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
if (-not (Test-Path "data-diagnosis.js")) {
    Write-Host "[错误] 找不到 data-diagnosis.js 文件" -ForegroundColor Red
    Write-Host "请确保在DAY项目根目录下运行此脚本" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}

# 询问用户要执行的操作
Write-Host "请选择操作:" -ForegroundColor Yellow
Write-Host "1. 只检查数据（不修改任何文件）"
Write-Host "2. 检查并修复数据问题"
Write-Host "3. 创建测试数据（会备份现有数据）"
Write-Host "4. 全部执行（检查、修复、创建测试数据）"
Write-Host ""

$choice = Read-Host "请输入选项 [1-4]"

$params = ""
switch ($choice) {
    "1" { $params = "" }
    "2" { $params = "--fix" }
    "3" { $params = "--create-test-data" }
    "4" { $params = "--fix --create-test-data" }
    default { 
        Write-Host "[错误] 无效的选项" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

# 运行诊断工具
Write-Host ""
Write-Host "[信息] 正在运行数据诊断工具..." -ForegroundColor Cyan
Write-Host "数据将保存在以下位置: $env:APPDATA\day\" -ForegroundColor Yellow
Write-Host ""

try {
    # 使用npx electron运行诊断脚本
    npx electron data-diagnosis.js $params
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[错误] 诊断工具运行失败" -ForegroundColor Red
        Write-Host "请检查错误信息并重试" -ForegroundColor Yellow
        Read-Host "按回车键退出"
    } else {
        Write-Host ""
        Write-Host "[完成] 诊断工具运行完成" -ForegroundColor Green
        if ($choice -eq "2" -or $choice -eq "4") {
            Write-Host "数据问题已尝试修复，请重新启动DAY应用查看效果。" -ForegroundColor Green
        }
        if ($choice -eq "3" -or $choice -eq "4") {
            Write-Host "测试数据已创建，原有数据已备份。" -ForegroundColor Green
        }
    }
} catch {
    Write-Host ""
    Write-Host "[错误] 运行过程中发生异常: $_" -ForegroundColor Red
    Read-Host "按回车键退出"
}

Write-Host ""
Read-Host "按回车键退出"
exit 0 