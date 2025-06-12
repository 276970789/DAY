const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
    // 数据存储相关
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    loadData: () => ipcRenderer.invoke('load-data'),
    exportData: (data) => ipcRenderer.invoke('export-data', data),
    
    // 备份相关
    createBackup: (data) => ipcRenderer.invoke('create-backup', data),
    getBackups: () => ipcRenderer.invoke('get-backups'),
    restoreBackup: (backupFilePath) => ipcRenderer.invoke('restore-backup', backupFilePath),
    deleteBackup: (backupFilePath) => ipcRenderer.invoke('delete-backup', backupFilePath),
    getDataStats: () => ipcRenderer.invoke('get-data-stats'),
    
    // 通知相关
    showNotification: (title, body, options) => ipcRenderer.invoke('show-notification', title, body, options),
    
    // 事件监听
    onQuickAddTask: (callback) => ipcRenderer.on('quick-add-task', callback),
    onNewTask: (callback) => ipcRenderer.on('new-task', callback),
    onNewProject: (callback) => ipcRenderer.on('new-project', callback),
    onExportData: (callback) => ipcRenderer.on('export-data', callback),
    onImportData: (callback) => ipcRenderer.on('import-data', callback),
    onSwitchView: (callback) => ipcRenderer.on('switch-view', callback),
    onBackupData: (callback) => ipcRenderer.on('backup-data', callback),
    onSetupReminders: (callback) => ipcRenderer.on('setup-reminders', callback),
    onShowTodayStats: (callback) => ipcRenderer.on('show-today-stats', callback),
    onCheckReminders: (callback) => ipcRenderer.on('check-reminders', callback),
    
    // 移除事件监听
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    
    // 平台信息
    platform: process.platform,
    
    // 版本信息
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
}); 