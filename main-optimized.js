const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 性能优化配置
app.commandLine.appendSwitch('--enable-gpu-rasterization');
app.commandLine.appendSwitch('--enable-zero-copy');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--max_old_space_size', '512'); // 限制内存使用

const store = new Store();
let mainWindow;
let tray;
let isQuitting = false;

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,  // 稍小的窗口
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
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
            if (!store.get('hasLaunched')) {
                store.set('hasLaunched', true);
                console.log('欢迎使用PlanFlow！');
            }
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
}

// 简化的托盘
function createTray() {
    // 使用更简单的图标
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    let trayIcon;
    
    try {
        trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    } catch (error) {
        // 如果图标不存在，使用简单的文本
        trayIcon = nativeImage.createEmpty();
    }
    
    tray = new Tray(trayIcon);
    
    // 简化的托盘菜单
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示',
            click: () => mainWindow.show()
        },
        {
            label: '退出',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);
    
    tray.setToolTip('PlanFlow');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        mainWindow.show();
    });
}

// 简化的菜单
function createMenuBar() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '新建任务',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('new-task')
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        isQuitting = true;
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '视图',
            submenu: [
                {
                    label: '今日概览',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => mainWindow.webContents.send('switch-view', 'dashboard')
                },
                {
                    label: '任务列表',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => mainWindow.webContents.send('switch-view', 'tasks')
                },
                { type: 'separator' },
                {
                    label: '开发者工具',
                    accelerator: 'F12',
                    click: () => mainWindow.webContents.openDevTools()
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC处理（简化版）
ipcMain.handle('save-data', async (event, data) => {
    try {
        store.set('appData', data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-data', async () => {
    try {
        const data = store.get('appData', {
            tasks: [],
            projects: [],
            diaries: []
        });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// 应用事件
app.whenReady().then(() => {
    createWindow();
    createTray();
    createMenuBar();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
});

// 内存管理
setInterval(() => {
    if (global.gc) {
        global.gc();
    }
}, 30000); // 每30秒清理一次内存 