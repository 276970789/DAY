const { app, BrowserWindow } = require('electron');
const path = require('path');

// 导入模块化组件
const { createMainWindow, setQuitting } = require('./src/window/windowManager');
const { createTray } = require('./src/tray/trayManager');
const { createMenuBar } = require('./src/menu/menuManager');
const { initDataPath, registerDataHandlers } = require('./src/ipc/dataHandlers');
const { registerBackupHandlers } = require('./src/ipc/backupHandlers');

// 性能优化配置
app.commandLine.appendSwitch('--enable-gpu-rasterization');
app.commandLine.appendSwitch('--enable-zero-copy');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--max_old_space_size', '512'); // 限制内存使用

// 设置应用名称以确保正确的userData路径
app.setName('day');

// 初始化数据路径
initDataPath(app.getPath('userData'));

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        const mainWindow = require('./src/window/windowManager').getMainWindow();
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// 注册所有IPC处理器
function registerAllHandlers() {
    registerDataHandlers(app);
    registerBackupHandlers(app);
}

// 应用事件
app.whenReady().then(() => {
    // 注册IPC处理器
    registerAllHandlers();
    
    // 创建主窗口
    const mainWindow = createMainWindow();
    
    // 创建托盘
    createTray(mainWindow);
    
    // 创建菜单栏
    createMenuBar(mainWindow);
    
    console.log('DAY应用初始化完成');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const mainWindow = createMainWindow();
        createTray(mainWindow);
        createMenuBar(mainWindow);
    }
});

app.on('before-quit', () => {
    setQuitting(true);
});

// 内存管理
setInterval(() => {
    if (global.gc) {
        global.gc();
    }
}, 30000); // 每30秒清理一次内存 