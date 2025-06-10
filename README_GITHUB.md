# PlanFlow 智能日程管理软件

这是一个基于Electron的跨平台桌面日程管理应用程序。

## 功能特点

- 📝 任务管理：创建、编辑、删除任务
- 📅 日历视图：直观的日程安排
- 📊 项目管理：按项目组织任务  
- 📔 日记功能：记录每日想法
- 🔔 通知提醒：任务到期提醒
- 🖥️ 系统托盘：最小化到托盘运行
- 💾 数据同步：本地数据存储

## 安装使用

### 开发环境运行

1. 确保已安装 Node.js (版本 >= 16)
2. 克隆项目到本地：
   ```bash
   git clone [仓库地址]
   cd 日程管理软件
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 启动应用：
   ```bash
   npm start
   ```

### 构建发布版本

- Windows: `npm run build-win`
- macOS: `npm run build-mac`  
- 所有平台: `npm run build`

## 技术栈

- Electron
- HTML/CSS/JavaScript
- electron-store (数据持久化)
- node-notifier (系统通知)

## 许可证

MIT License 