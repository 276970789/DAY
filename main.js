const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// 性能优化配置
app.commandLine.appendSwitch('--enable-gpu-rasterization');
app.commandLine.appendSwitch('--enable-zero-copy');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--max_old_space_size', '512'); // 限制内存使用

// 使用文件系统代替electron-store
const dataPath = path.join(app.getPath('userData'), 'day-data.json');

const store = {
    get: (key, defaultValue) => {
        try {
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                return data[key] !== undefined ? data[key] : defaultValue;
            }
            return defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            let data = {};
            if (fs.existsSync(dataPath)) {
                data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            }
            data[key] = value;
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`数据保存成功: ${key}`, typeof value === 'object' ? Object.keys(value) : value);
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }
};
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
        icon: path.join(__dirname, 'assets', '图标.png'),
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
                console.log('欢迎使用DAY！');
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

// 创建高质量托盘图标
function createHighQualityTrayIcon() {
    // 创建一个简洁清晰的SVG图标
    const svgIcon = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="6" width="24" height="20" rx="2" fill="#2196F3" stroke="#1976D2" stroke-width="2"/>
            <rect x="6" y="10" width="20" height="2" fill="#ffffff" rx="1"/>
            <rect x="6" y="14" width="16" height="2" fill="#ffffff" rx="1"/>
            <rect x="6" y="18" width="12" height="2" fill="#ffffff" rx="1"/>
            <circle cx="24" cy="8" r="2" fill="#FF5722"/>
            <text x="16" y="4" text-anchor="middle" font-family="Arial" font-size="6" font-weight="bold" fill="#333">DAY</text>
        </svg>`;
    
    // 将SVG转换为PNG数据URL
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
    return nativeImage.createFromDataURL(dataUrl);
}

// 优化的托盘图标
function createTray() {
    const iconPath = path.join(__dirname, 'assets', '图标.png');
    let trayIcon;
    
    try {
        // 首先尝试使用原始图标
        const originalIcon = nativeImage.createFromPath(iconPath);
        
        if (!originalIcon.isEmpty()) {
            // 为不同平台优化图标
            if (process.platform === 'win32') {
                // Windows 系统 - 使用多种尺寸以适应不同DPI
                trayIcon = originalIcon.resize({ 
                    width: 16, 
                    height: 16, 
                    quality: 'best' 
                });
                
                // 添加高DPI版本
                const icon32 = originalIcon.resize({ 
                    width: 32, 
                    height: 32, 
                    quality: 'best' 
                });
                
                // 为高DPI显示器添加2x版本
                trayIcon.addRepresentation({
                    scaleFactor: 2.0,
                    width: 32,
                    height: 32,
                    buffer: icon32.toPNG()
                });
                
            } else if (process.platform === 'darwin') {
                // macOS 系统 - 使用模板图标
                trayIcon = originalIcon.resize({ 
                    width: 16, 
                    height: 16, 
                    quality: 'best' 
                });
                trayIcon.setTemplateImage(true);
            } else {
                // Linux 系统
                trayIcon = originalIcon.resize({ 
                    width: 22, 
                    height: 22, 
                    quality: 'best' 
                });
            }
        } else {
            throw new Error('图标文件为空或无效');
        }
    } catch (error) {
        console.log('使用原始图标失败，创建自定义高质量图标:', error.message);
        // 使用自定义的高质量图标
        const customIcon = createHighQualityTrayIcon();
        
        if (process.platform === 'win32') {
            trayIcon = customIcon.resize({ width: 16, height: 16, quality: 'best' });
        } else if (process.platform === 'darwin') {
            trayIcon = customIcon.resize({ width: 16, height: 16, quality: 'best' });
            trayIcon.setTemplateImage(true);
        } else {
            trayIcon = customIcon.resize({ width: 22, height: 22, quality: 'best' });
        }
    }
    
    tray = new Tray(trayIcon);
    
    // 简化的托盘菜单
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示 DAY',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { type: 'separator' },
        {
            label: '新建任务',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('new-task');
                }
            }
        },
        { type: 'separator' },
        {
            label: '退出',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);
    
    tray.setToolTip('DAY - 智能日程管理');
    tray.setContextMenu(contextMenu);
    
    // 双击显示窗口
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
    
    // 单击也显示窗口（Windows 用户习惯）
    if (process.platform === 'win32') {
        tray.on('click', () => {
            if (mainWindow) {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        });
    }
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