Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取当前脚本所在目录
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 检查启动脚本是否存在
startupScript = currentDir & "\启动DAY.bat"
If Not fso.FileExists(startupScript) Then
    MsgBox "错误：找不到启动脚本文件" & vbCrLf & "请确保 启动DAY.bat 文件存在", vbCritical, "DAY 启动错误"
    WScript.Quit
End If

' 静默启动，不显示命令行窗口
WshShell.Run """" & startupScript & """", 0, False

' 等待一会儿后显示启动提示
WScript.Sleep 2000

' 可选：显示启动通知
MsgBox "DAY 日程管理软件正在启动..." & vbCrLf & vbCrLf & "• 应用将在独立窗口中打开" & vbCrLf & "• 可在系统托盘中找到应用图标", vbInformation, "DAY 启动中" 