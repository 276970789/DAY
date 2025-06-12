const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let tray = null;

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

// 创建托盘
function createTray(mainWindow) {
    const iconPath = path.join(__dirname, '../../assets', '图标.png');
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
            // 原图标无效，使用高质量后备图标
            console.log('使用SVG后备图标');
            trayIcon = createHighQualityTrayIcon();
        }
    } catch (error) {
        console.error('创建托盘图标失败，使用后备图标:', error);
        trayIcon = createHighQualityTrayIcon();
    }

    tray = new Tray(trayIcon);
    
    // 设置工具提示
    tray.setToolTip('DAY - 智能日程管理');
    
    // 创建上下文菜单
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示主窗口',
            click: () => {
                if (mainWindow) {
                    if (mainWindow.isMinimized()) mainWindow.restore();
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            label: '隐藏窗口',
            click: () => {
                if (mainWindow) {
                    mainWindow.hide();
                }
            }
        },
        { type: 'separator' },
        {
            label: '新建任务',
            click: () => {
                if (mainWindow) {
                    mainWindow.webContents.send('quick-add-task');
                    if (!mainWindow.isVisible()) {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            }
        },
        {
            label: '今日统计',
            click: () => {
                if (mainWindow) {
                    mainWindow.webContents.send('show-today-stats');
                    if (!mainWindow.isVisible()) {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            }
        },
        { type: 'separator' },
        {
            label: '退出DAY',
            click: () => {
                require('electron').app.quit();
            }
        }
    ]);
    
    tray.setContextMenu(contextMenu);
    
    // 双击托盘图标显示/隐藏窗口
    tray.on('double-click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });

    // 右键单击显示菜单（Windows 需要特殊处理）
    if (process.platform === 'win32') {
        tray.on('right-click', () => {
            tray.popUpContextMenu();
        });
    }

    console.log('托盘图标创建成功');
    return tray;
}

// 更新托盘图标
function updateTrayIcon(iconPath) {
    if (tray) {
        try {
            const icon = nativeImage.createFromPath(iconPath);
            tray.setImage(icon);
        } catch (error) {
            console.error('更新托盘图标失败:', error);
        }
    }
}

// 更新托盘工具提示
function updateTrayTooltip(tooltip) {
    if (tray) {
        tray.setToolTip(tooltip);
    }
}

// 销毁托盘
function destroyTray() {
    if (tray) {
        tray.destroy();
        tray = null;
    }
}

// 获取托盘实例
function getTray() {
    return tray;
}

module.exports = {
    createTray,
    updateTrayIcon,
    updateTrayTooltip,
    destroyTray,
    getTray
}; 