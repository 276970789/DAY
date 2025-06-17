// 设置控制台输出编码为UTF-8
process.env.LANG = 'zh_CN.UTF-8';

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// 自定义日志函数，避免直接输出中文到控制台
const log = {
  info: (message) => {
    // 只在开发环境输出详细日志
    if (process.env.NODE_ENV === 'development') {
      console.log(message);
    } else if (typeof message === 'string' && message.match(/[\u4e00-\u9fa5]/)) {
      // 包含中文字符时，输出英文替代信息
      console.log('[INFO] App message logged');
    } else {
      // 不包含中文时正常输出
      console.log(message);
    }
  },
  error: (message, error) => {
    if (error) {
      console.error(`[ERROR] ${error.message || error}`);
    } else {
      console.error(`[ERROR] An error occurred`);
    }
  }
};

// 导入模块化组件
const { createMainWindow, setQuitting, showMainWindow, getMainWindow } = require('./src/window/windowManager');
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

// 注册系统通知处理器
function registerNotificationHandlers() {
    // 显示系统通知
    ipcMain.handle('show-notification', async (event, title, body, options = {}) => {
        try {
            const { Notification } = require('electron');
            const notification = new Notification({
                title: title,
                body: body,
                icon: path.join(__dirname, './assets', '图标.png'),
                ...options
            });
            notification.show();
            return { success: true };
        } catch (error) {
            log.error('显示通知失败:', error);
            return { success: false, error: error.message };
        }
    });
}

// 注册全局快捷键
function registerGlobalShortcuts() {
    try {
        // 注册全局快捷键 Ctrl+Shift+D 来快速唤出DAY应用
        const ret = globalShortcut.register('CommandOrControl+Shift+D', () => {
            const mainWindow = getMainWindow();
            if (mainWindow) {
                if (mainWindow.isVisible()) {
                    // 如果窗口已显示，则隐藏
                    mainWindow.hide();
                } else {
                    // 如果窗口隐藏，则显示并切换到MY DAY页面
                    showMainWindow();
                    // 发送消息切换到MY DAY页面
                    setTimeout(() => {
                        mainWindow.webContents.send('switch-to-dashboard');
                    }, 100);
                }
            } else {
                // 如果窗口不存在，创建新窗口
                const newWindow = createMainWindow();
                createTray(newWindow);
                createMenuBar(newWindow);
                setTimeout(() => {
                    newWindow.webContents.send('switch-to-dashboard');
                }, 500);
            }
        });

        if (!ret) {
            log.error('全局快捷键注册失败');
        } else {
            log.info('全局快捷键 Ctrl+Shift+D 注册成功');
        }

        // 注册第二个快捷键 Ctrl+Alt+D 作为备选
        const ret2 = globalShortcut.register('CommandOrControl+Alt+D', () => {
            const mainWindow = getMainWindow();
            if (mainWindow) {
                showMainWindow();
                setTimeout(() => {
                    mainWindow.webContents.send('switch-to-dashboard');
                }, 100);
            }
        });

        if (ret2) {
            log.info('备选快捷键 Ctrl+Alt+D 注册成功');
        }

    } catch (error) {
        log.error('注册全局快捷键时出错:', error);
    }
}

// 注册所有IPC处理器
function registerAllHandlers() {
    registerDataHandlers(app);
    registerBackupHandlers(app);
    registerNotificationHandlers();
    
    // 添加诊断处理器
    ipcMain.handle('diagnose-data', async (event) => {
        try {
            const fs = require('fs');
            const dataPath = path.join(app.getPath('userData'), 'day-data.json');
            const backupPath = path.join(app.getPath('userData'), 'day-data-backup.json');
            
            const stats = {
                appPath: app.getPath('userData'),
                dataExists: fs.existsSync(dataPath),
                backupExists: fs.existsSync(backupPath),
                dataFileSize: fs.existsSync(dataPath) ? fs.statSync(dataPath).size : 0,
                backupFileSize: fs.existsSync(backupPath) ? fs.statSync(backupPath).size : 0
            };
            
            return { success: true, stats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

// 应用事件
app.whenReady().then(() => {
    // 注册IPC处理器
    registerAllHandlers();
    
    // 注册全局快捷键
    registerGlobalShortcuts();
    
    // 创建主窗口
    const mainWindow = createMainWindow();
    
    // 创建托盘
    createTray(mainWindow);
    
    // 创建菜单栏
    createMenuBar(mainWindow);
    
    log.info('DAY application initialized');
    
    // 应用启动后自动运行数据诊断
    setTimeout(() => {
        if (mainWindow) {
            mainWindow.webContents.send('message', {
                type: 'diagnostic-complete',
                message: '应用启动诊断完成'
            });
        }
    }, 3000);
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

app.on('will-quit', () => {
    // 注销所有全局快捷键
    globalShortcut.unregisterAll();
});

// 内存管理
setInterval(() => {
    if (global.gc) {
        global.gc();
    }
}, 30000); // 每30秒清理一次内存 