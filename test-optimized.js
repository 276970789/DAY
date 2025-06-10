const { app, BrowserWindow } = require('electron');
const path = require('path');

let testWindow;

function createTestWindow() {
    testWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'PlanFlow - 优化版本测试',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true
        },
        show: false
    });

    // 加载优化版本的HTML
    testWindow.loadFile('renderer-optimized.html');

    testWindow.once('ready-to-show', () => {
        testWindow.show();
        console.log('优化版本已启动');
        
        // 监控性能
        testWindow.webContents.on('dom-ready', () => {
            console.log('DOM加载完成');
        });

        // 5秒后显示内存使用情况
        setTimeout(() => {
            const memoryUsage = process.memoryUsage();
            console.log('内存使用情况:');
            console.log(`RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`);
            console.log(`Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
            console.log(`Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
        }, 5000);
    });

    testWindow.on('closed', () => {
        testWindow = null;
    });

    // 开启开发者工具查看性能
    testWindow.webContents.openDevTools();
}

app.whenReady().then(createTestWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createTestWindow();
    }
}); 