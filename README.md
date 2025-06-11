# PlanFlow - 智能日程管理桌面应用

PlanFlow 是一个基于 Electron 开发的简洁高效的日程管理桌面应用程序，专为提高个人和团队生产力而设计。

## 主要功能

### 📋 任务管理
- 创建、编辑、删除任务
- 设置任务截止日期
- 任务完成状态跟踪
- 任务优先级管理

### 📁 项目管理
- 创建和管理项目
- 项目进度跟踪
- 任务与项目关联

### 📅 日历视图
- 月度、周度、日度视图
- 直观的日程安排
- 快速添加日程

### 📝 日记功能
- 日记记录与管理
- 心情和天气记录
- @任务引用功能
- 标签分类

### 🔔 系统集成
- 系统托盘图标
- 桌面通知
- 快捷键支持

## 技术栈

- **前端**: HTML5, CSS3, JavaScript
- **后端**: Electron, Node.js
- **数据存储**: electron-store (本地JSON文件)

## 安装与运行

### 开发环境

1. 确保已安装 Node.js (推荐 16.x 或更高版本)
2. 克隆项目到本地
3. 安装依赖：
   ```bash
   npm install
   ```
4. 运行应用：
   ```bash
   npm start
   ```

### 生产环境

#### Windows 用户
运行 `install.bat` 批处理文件自动安装依赖并启动应用

#### macOS/Linux 用户
运行 `install.sh` 脚本自动安装依赖并启动应用

## 打包发布

```bash
# 打包 Windows 版本
npm run build-win

# 打包 macOS 版本
npm run build-mac

# 构建所有平台版本
npm run build
```

## 项目结构

```
PlanFlow/
├── main.js                 # Electron 主进程
├── renderer-simple.html    # 前端界面
├── preload.js             # 预加载脚本
├── package.json           # 项目配置
├── assets/                # 资源文件
│   └── 图标.png           # 应用图标
├── install.bat            # Windows 安装脚本
├── install.sh             # Unix 安装脚本
└── README.md              # 项目说明
```

## 特性说明

- **轻量级**: 使用简化的代码结构，启动速度快
- **本地存储**: 数据保存在本地，保护隐私
- **跨平台**: 支持 Windows、macOS、Linux
- **现代化界面**: 简洁美观的用户界面
- **系统集成**: 完善的系统托盘和通知功能

## 许可证

MIT License

## 作者

PlanFlow Team - 专注于提高工作效率的桌面应用开发

## 技术支持

如有问题或建议，请创建 GitHub Issue 或联系开发团队。 