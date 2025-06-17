# 设置编码
$OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "重启 DAY 应用"

Write-Host "=============================================
           🔄 重启 DAY 应用
==============================================" -ForegroundColor Cyan
Write-Host ""

# 关闭运行中的DAY进程
Write-Host "[信息] 正在检查并关闭运行中的DAY进程..." -ForegroundColor Yellow

$dayProcesses = Get-Process | Where-Object { $_.ProcessName -eq "electron" -or $_.ProcessName -eq "day" }

if ($dayProcesses) {
    foreach ($process in $dayProcesses) {
        try {
            Stop-Process -Id $process.Id -Force
            Write-Host "[✓] 已关闭DAY进程: $($process.Id)" -ForegroundColor Green
        } catch {
            Write-Host "[错误] 无法关闭进程: $($process.Id)" -ForegroundColor Red
        }
    }
    
    # 等待进程完全关闭
    Start-Sleep -Seconds 2
} else {
    Write-Host "[信息] 未检测到运行中的DAY进程" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[信息] 正在启动DAY应用..." -ForegroundColor Yellow

# 启动DAY应用
try {
    $startScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "启动DAY.ps1"
    if (Test-Path $startScriptPath) {
        & $startScriptPath
    } else {
        # 如果找不到启动脚本，尝试直接启动应用
        if (Test-Path "main.js") {
            npm start
        } else {
            Write-Host "[错误] 无法找到应用启动文件" -ForegroundColor Red
            Write-Host "请确保在DAY项目根目录下运行此脚本" -ForegroundColor Yellow
            Read-Host "按回车键退出"
            exit 1
        }
    }
} catch {
    Write-Host "[错误] 启动DAY应用时出错: $_" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

exit 0 