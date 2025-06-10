const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');
const notifier = require('node-notifier');

// 创建数据存储
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
        // 如果有第二个实例，聚焦到主窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

function createWindow() {
    // 创建主窗口
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        show: false, // 先不显示，等加载完成后再显示
        autoHideMenuBar: true // 自动隐藏菜单栏
    });

    // 加载HTML文件
    mainWindow.loadFile('renderer.html');

    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 检查是否是第一次启动
        if (!store.get('hasLaunched')) {
            store.set('hasLaunched', true);
            showWelcomeNotification();
        }
    });

    // 窗口关闭事件
    mainWindow.on('close', (event) => {
        if (!isQuitting && process.platform === 'darwin') {
            event.preventDefault();
            mainWindow.hide();
        } else if (!isQuitting && process.platform === 'win32') {
            event.preventDefault();
            mainWindow.hide();
            showTrayNotification('PlanFlow已最小化到系统托盘');
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 处理外部链接
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function createTray() {
    // 创建系统托盘
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    
    tray = new Tray(trayIcon);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示PlanFlow',
            click: () => {
                mainWindow.show();
                if (process.platform === 'darwin') {
                    app.dock.show();
                }
            }
        },
        {
            label: '快速添加任务',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('quick-add-task');
            }
        },
        { type: 'separator' },
        {
            label: '今日统计',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('show-today-stats');
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
    
    tray.setToolTip('PlanFlow - 智能日程管理');
    tray.setContextMenu(contextMenu);
    
    // 双击托盘图标显示窗口
    tray.on('double-click', () => {
        mainWindow.show();
    });
}

function createMenuBar() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '新建任务',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('new-task');
                    }
                },
                {
                    label: '新建项目',
                    accelerator: 'CmdOrCtrl+Shift+N',
                    click: () => {
                        mainWindow.webContents.send('new-project');
                    }
                },
                { type: 'separator' },
                {
                    label: '导出数据',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('export-data');
                    }
                },
                {
                    label: '导入数据',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => {
                        importData();
                    }
                },
                { type: 'separator' },
                {
                    label: process.platform === 'darwin' ? '退出PlanFlow' : '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
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
                    click: () => {
                        mainWindow.webContents.send('switch-view', 'dashboard');
                    }
                },
                {
                    label: '日历视图',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => {
                        mainWindow.webContents.send('switch-view', 'calendar');
                    }
                },
                {
                    label: '任务列表',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => {
                        mainWindow.webContents.send('switch-view', 'tasks');
                    }
                },
                {
                    label: '项目管理',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => {
                        mainWindow.webContents.send('switch-view', 'projects');
                    }
                },
                {
                    label: '日记本',
                    accelerator: 'CmdOrCtrl+5',
                    click: () => {
                        mainWindow.webContents.send('switch-view', 'diary');
                    }
                },
                { type: 'separator' },
                {
                    label: '刷新',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: '开发者工具',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: '工具',
            submenu: [
                {
                    label: '数据备份',
                    click: () => {
                        mainWindow.webContents.send('backup-data');
                    }
                },
                {
                    label: '设置提醒',
                    click: () => {
                        mainWindow.webContents.send('setup-reminders');
                    }
                },
                { type: 'separator' },
                {
                    label: '关于PlanFlow',
                    click: () => {
                        showAboutDialog();
                    }
                }
            ]
        }
    ];

    // macOS特殊处理
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: '关于PlanFlow',
                    click: () => {
                        showAboutDialog();
                    }
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC事件处理
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
            diaries: [],
            currentDate: new Date().toISOString()
        });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('export-data', async (event, data) => {
    try {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: '导出数据',
            defaultPath: `planflow-data-${new Date().toISOString().split('T')[0]}.json`,
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled) {
            const fs = require('fs');
            fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
            showNotification('数据导出成功', `文件已保存到: ${result.filePath}`);
            return { success: true, filePath: result.filePath };
        }

        return { success: false, cancelled: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-notification', async (event, title, body, options = {}) => {
    showNotification(title, body, options);
});

async function importData() {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: '导入数据',
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const fs = require('fs');
            const fileContent = fs.readFileSync(result.filePaths[0], 'utf8');
            const data = JSON.parse(fileContent);
            
            mainWindow.webContents.send('import-data', data);
            showNotification('数据导入成功', '数据已成功导入到应用中');
        }
    } catch (error) {
        showNotification('导入失败', `数据导入失败: ${error.message}`);
    }
}

function showNotification(title, body, options = {}) {
    if (Notification.isSupported()) {
        new Notification({
            title,
            body,
            icon: path.join(__dirname, 'assets', 'icon.png'),
            ...options
        }).show();
    } else {
        // 备用通知方式
        notifier.notify({
            title,
            message: body,
            icon: path.join(__dirname, 'assets', 'icon.png'),
            sound: false,
            wait: false
        });
    }
}

function showTrayNotification(message) {
    if (tray) {
        tray.displayBalloon({
            iconType: 'info',
            title: 'PlanFlow',
            content: message
        });
    }
}

function showWelcomeNotification() {
    showNotification(
        '欢迎使用PlanFlow！',
        '您的智能日程管理助手已准备就绪。点击托盘图标可快速访问功能。',
        { urgency: 'normal' }
    );
}

function showAboutDialog() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '关于PlanFlow',
        message: 'PlanFlow v1.0.0',
        detail: '智能日程管理桌面软件\n\n功能特性:\n• 任务管理与跟踪\n• 项目进度管理\n• 日历视图\n• 日记记录\n• 数据导入导出\n• 系统通知提醒\n\n© 2024 PlanFlow Team',
        buttons: ['确定'],
        defaultId: 0
    });
}

// 应用事件处理
app.whenReady().then(() => {
    createWindow();
    createTray();
    createMenuBar();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
});

// 防止GPU进程崩溃
app.disableHardwareAcceleration();

// 安全设置
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// 设置定时提醒功能
function setupReminders() {
    setInterval(() => {
        // 每小时检查一次待办任务
        mainWindow.webContents.send('check-reminders');
    }, 60 * 60 * 1000); // 1小时
}

// 启动后设置提醒
app.whenReady().then(() => {
    setTimeout(setupReminders, 5000); // 5秒后开始
}); 