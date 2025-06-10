# 🖥️ PlanFlow Electron桌面版本

## 📦 项目结构

```
📁 日程管理软件/
├── 📄 package.json          - 项目配置文件
├── 📄 main.js              - Electron主进程
├── 📄 preload.js           - 预加载脚本
├── 📄 renderer.html        - 渲染进程HTML文件
├── 📁 assets/              - 资源文件夹
│   ├── icon.png            - 应用图标
│   ├── icon.ico            - Windows图标
│   ├── icon.icns           - macOS图标
│   └── tray-icon.png       - 托盘图标
├── 📄 index.html           - 浏览器版本（保留）
└── 📁 dist/                - 打包输出文件夹
```

## 🚀 安装与运行

### 1. 安装Node.js
确保您的系统已安装Node.js (建议版本 16+)
- 下载地址：https://nodejs.org/

### 2. 安装依赖
```bash
# 进入项目目录
cd 日程管理软件

# 安装项目依赖
npm install
```

### 3. 运行开发版本
```bash
# 启动应用
npm start

# 或者开发模式运行
npm run dev
```

### 4. 构建发布版本

#### Windows版本
```bash
npm run build-win
```

#### macOS版本
```bash
npm run build-mac
```

#### 所有平台
```bash
npm run build
```

构建完成后，安装包会生成在 `dist/` 文件夹中。

## ✨ 桌面版特有功能

### 🖥️ 系统集成
- **系统托盘**: 最小化到系统托盘，后台运行
- **系统通知**: 任务提醒、完成通知
- **开机自启**: 可设置开机自动启动
- **快捷键**: 全局快捷键支持

### 📁 文件操作
- **原生文件对话框**: 使用系统原生的文件选择器
- **更好的数据存储**: 使用electron-store替代localStorage
- **安全的文件导入导出**: 原生文件操作

### 🎯 菜单栏功能
```
文件菜单:
├── 新建任务 (Ctrl+N)
├── 新建项目 (Ctrl+Shift+N)
├── 导出数据 (Ctrl+E)
├── 导入数据 (Ctrl+I)
└── 退出 (Ctrl+Q)

视图菜单:
├── 今日概览 (Ctrl+1)
├── 日历视图 (Ctrl+2)
├── 任务列表 (Ctrl+3)
├── 项目管理 (Ctrl+4)
├── 日记本 (Ctrl+5)
├── 刷新 (Ctrl+R)
└── 开发者工具 (F12)

工具菜单:
├── 数据备份
├── 设置提醒
└── 关于PlanFlow
```

### 🔔 托盘菜单
- 显示PlanFlow
- 快速添加任务
- 今日统计
- 退出

## 📱 跨平台支持

### Windows
- ✅ Windows 10/11 支持
- ✅ NSIS安装程序
- ✅ 开始菜单快捷方式
- ✅ 桌面快捷方式
- ✅ 系统托盘集成

### macOS
- ✅ macOS 10.15+ 支持
- ✅ DMG安装包
- ✅ 应用程序文件夹集成
- ✅ Dock栏集成
- ✅ 原生菜单栏

### Linux (可选)
- ✅ Ubuntu/Debian支持
- ✅ AppImage格式
- ✅ 系统托盘支持

## 🛠️ 开发说明

### 技术栈
- **Electron**: 桌面应用框架
- **Node.js**: 后端运行时
- **HTML/CSS/JavaScript**: 前端技术
- **electron-store**: 数据持久化
- **node-notifier**: 跨平台通知

### 主要模块
1. **main.js**: 主进程，负责窗口管理、菜单、托盘等
2. **preload.js**: 预加载脚本，提供安全的API接口
3. **renderer.html**: 渲染进程，UI界面和业务逻辑

### 安全考虑
- ✅ 禁用Node.js集成
- ✅ 启用上下文隔离
- ✅ 使用preload脚本安全通信
- ✅ 禁用unsafe-eval

## 📋 使用指南

### 首次启动
1. 双击桌面图标或从开始菜单启动
2. 应用会显示欢迎通知
3. 开始创建您的第一个任务

### 系统托盘使用
- **最小化**: 关闭窗口时自动最小化到托盘
- **快速操作**: 右键托盘图标查看菜单
- **恢复窗口**: 双击托盘图标

### 数据管理
- **自动保存**: 所有数据自动保存到本地
- **数据位置**: 
  - Windows: `%APPDATA%/planflow/`
  - macOS: `~/Library/Application Support/planflow/`
- **备份恢复**: 使用菜单的导入导出功能

### 通知设置
- 任务创建通知
- 任务到期提醒（2小时前）
- 应用状态变化通知

## 🔧 故障排除

### 常见问题

**Q: 应用无法启动？**
A: 检查Node.js版本，确保>=16.0

**Q: 通知不显示？**
A: 检查系统通知权限设置

**Q: 数据丢失？**
A: 查看数据存储位置，使用备份恢复

**Q: 托盘图标不显示？**
A: 重启应用或检查系统托盘设置

### 日志查看
开发模式下按F12打开开发者工具查看日志。

## 📦 打包配置

### 自定义构建
编辑 `package.json` 中的 `build` 配置：

```json
{
  "build": {
    "appId": "com.planflow.app",
    "productName": "PlanFlow",
    "directories": {
      "output": "dist"
    }
  }
}
```

### 图标要求
- **Windows**: 256x256 PNG 或 ICO
- **macOS**: 512x512 PNG 或 ICNS
- **Linux**: 512x512 PNG

## 🎯 性能优化

### 启动优化
- 延迟加载非关键模块
- 优化窗口创建时机
- 减少初始包大小

### 内存优化
- 及时清理事件监听
- 避免内存泄漏
- 优化渲染进程资源

## 📄 许可证

本项目使用 MIT 许可证，详见 LICENSE 文件。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

**享受您的PlanFlow桌面版体验！** 🎉 