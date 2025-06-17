' DAY 任务管理应用 - VBS 静默启动脚本
' 此脚本会在后台静默启动DAY应用，不显示命令行窗口

Dim objShell, objFSO, scriptPath, appPath, cmdLine

' 创建对象
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录的父目录（应用根目录）
scriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
appPath = objFSO.GetParentFolderName(scriptPath)

' 切换到应用目录
objShell.CurrentDirectory = appPath

' 检查Node.js是否安装
On Error Resume Next
objShell.Run "node --version", 0, True
If Err.Number <> 0 Then
    MsgBox "错误：未找到Node.js，请先安装Node.js" & vbCrLf & "下载地址: https://nodejs.org/", vbCritical, "DAY启动错误"
    WScript.Quit 1
End If
On Error GoTo 0

' 检查依赖是否安装
If Not objFSO.FolderExists(appPath & "\node_modules") Then
    ' 显示安装依赖的提示
    If MsgBox("需要安装依赖包，这可能需要几分钟时间。" & vbCrLf & "是否继续？", vbYesNo + vbQuestion, "DAY初始化") = vbYes Then
        ' 显示安装进度（非静默）
        objShell.Run "cmd /c echo 正在安装依赖包... && npm install && echo 安装完成，正在启动应用... && timeout /t 2", 1, True
    Else
        WScript.Quit 0
    End If
End If

' 构建启动命令
cmdLine = "cmd /c npm start"

' 静默启动应用（窗口状态：0=隐藏，1=正常，2=最小化，3=最大化）
objShell.Run cmdLine, 0, False

' 显示启动提示
MsgBox "DAY应用正在后台启动..." & vbCrLf & vbCrLf & _
       "全局快捷键：" & vbCrLf & _
       "• Ctrl+Shift+D : 快速唤出/隐藏DAY应用" & vbCrLf & _
       "• Ctrl+Alt+D   : 备选快捷键", vbInformation, "DAY启动成功"

' 清理对象
Set objShell = Nothing
Set objFSO = Nothing 