const { BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;
let isQuitting = false;

// 创建主窗口
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,  // 稍小的窗口
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, '../../assets', '图标.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../../preload.js'),
            webSecurity: true,
            // 性能优化配置
            enableRemoteModule: false,
            worldSafeExecuteJavaScript: true,
            sandbox: false,
            // 启用硬件加速
            hardwareAcceleration: true,
            // 内存优化
            v8CacheOptions: 'code',
            // 禁用不需要的功能
            webgl: false,
            plugins: false,
            java: false,
            experimentalFeatures: false
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        show: false,
        autoHideMenuBar: true,
        // 性能优化
        useContentSize: true,
        transparent: false, // 禁用透明度以提高性能
        frame: true
    });

    // 加载简化版HTML文件
    mainWindow.loadFile('renderer-simple.html');

    // 优化的窗口显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 延迟执行非关键操作
        setTimeout(() => {
            console.log('DAY应用已启动');
        }, 1000);
    });

    // 优化内存使用
    mainWindow.webContents.on('dom-ready', () => {
        // 清理内存
        if (global.gc) {
            global.gc();
        }
    });

    // 窗口关闭事件
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 禁用右键菜单（减少资源使用）
    mainWindow.webContents.on('context-menu', (event) => {
        event.preventDefault();
    });

    return mainWindow;
}

// 获取主窗口实例
function getMainWindow() {
    return mainWindow;
}

// 显示主窗口
function showMainWindow() {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
}

// 隐藏主窗口
function hideMainWindow() {
    if (mainWindow) {
        mainWindow.hide();
    }
}

// 设置退出状态
function setQuitting(quitting) {
    isQuitting = quitting;
}

// 检查是否正在退出
function isAppQuitting() {
    return isQuitting;
}

module.exports = {
    createMainWindow,
    getMainWindow,
    showMainWindow,
    hideMainWindow,
    setQuitting,
    isAppQuitting
}; 