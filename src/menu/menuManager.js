const { Menu } = require('electron');

// 创建应用菜单
function createMenuBar(mainWindow) {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '新建任务',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('new-task')
                },
                {
                    label: '新建项目',
                    accelerator: 'CmdOrCtrl+Shift+N',
                    click: () => mainWindow.webContents.send('new-project')
                },
                { type: 'separator' },
                {
                    label: '导出数据',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => mainWindow.webContents.send('export-data')
                },
                {
                    label: '导入数据',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => mainWindow.webContents.send('import-data')
                },
                { type: 'separator' },
                {
                    label: '创建备份',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => mainWindow.webContents.send('backup-data')
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        require('electron').app.quit();
                    }
                }
            ]
        },
        {
            label: '编辑',
            submenu: [
                {
                    label: '撤销',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: '重做',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                { type: 'separator' },
                {
                    label: '剪切',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: '复制',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: '粘贴',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                }
            ]
        },
        {
            label: '工具',
            submenu: [
                {
                    label: '快速添加任务',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => mainWindow.webContents.send('quick-add-task')
                },
                { type: 'separator' },
                {
                    label: '设置提醒',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => mainWindow.webContents.send('setup-reminders')
                },
                {
                    label: '今日统计',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => mainWindow.webContents.send('show-today-stats')
                },
                { type: 'separator' },
                {
                    label: '检查提醒',
                    click: () => mainWindow.webContents.send('check-reminders')
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
                {
                    label: '日历视图',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => mainWindow.webContents.send('switch-view', 'calendar')
                },
                {
                    label: '项目管理',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => mainWindow.webContents.send('switch-view', 'projects')
                },
                {
                    label: '我的日记',
                    accelerator: 'CmdOrCtrl+5',
                    click: () => mainWindow.webContents.send('switch-view', 'diary')
                },
                {
                    label: '数据备份',
                    accelerator: 'CmdOrCtrl+6',
                    click: () => mainWindow.webContents.send('switch-view', 'backup')
                },
                { type: 'separator' },
                {
                    label: '开发者工具',
                    accelerator: 'F12',
                    click: () => mainWindow.webContents.openDevTools()
                }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于DAY',
                    click: () => {
                        require('electron').dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于DAY',
                            message: 'DAY - 智能日程管理软件',
                            detail: 'Version 1.0.0\n\n一个简洁高效的日程管理桌面应用程序。',
                            buttons: ['确定']
                        });
                    }
                }
            ]
        }
    ];

    // macOS特殊处理
    if (process.platform === 'darwin') {
        template.unshift({
            label: 'DAY',
            submenu: [
                {
                    label: '关于DAY',
                    role: 'about'
                },
                { type: 'separator' },
                {
                    label: '服务',
                    role: 'services',
                    submenu: []
                },
                { type: 'separator' },
                {
                    label: '隐藏DAY',
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: '隐藏其他',
                    accelerator: 'Command+Shift+H',
                    role: 'hideothers'
                },
                {
                    label: '显示全部',
                    role: 'unhide'
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: 'Command+Q',
                    click: () => {
                        require('electron').app.quit();
                    }
                }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

module.exports = {
    createMenuBar
}; 