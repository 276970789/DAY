const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let dataPath;

// 初始化数据路径
function initDataPath(userDataPath) {
    dataPath = path.join(userDataPath, 'day-data.json');
}

// 注册备份相关的IPC处理器
function registerBackupHandlers(app) {
    // 手动备份处理器
    ipcMain.handle('create-backup', async (event, data) => {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `day-backup-${timestamp}.json`;
            const backupDir = path.join(app.getPath('userData'), 'backups');
            
            // 确保备份目录存在
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            const fullBackupPath = path.join(backupDir, backupFileName);
            const backupData = {
                ...data,
                backupTime: new Date().toISOString(),
                version: '1.0.0'
            };
            
            fs.writeFileSync(fullBackupPath, JSON.stringify(backupData, null, 2), 'utf8');
            
            console.log('手动备份创建成功:', fullBackupPath);
            
            return {
                success: true,
                message: '备份创建成功',
                backupPath: fullBackupPath,
                fileName: backupFileName
            };
        } catch (error) {
            console.error('创建备份失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // 获取备份列表处理器
    ipcMain.handle('get-backups', async (event) => {
        try {
            const backupDir = path.join(app.getPath('userData'), 'backups');
            
            if (!fs.existsSync(backupDir)) {
                return { success: true, backups: [] };
            }
            
            const files = fs.readdirSync(backupDir);
            const backups = files
                .filter(file => file.startsWith('day-backup-') && file.endsWith('.json'))
                .map(file => {
                    const filePath = path.join(backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        fileName: file,
                        filePath: filePath,
                        size: stats.size,
                        createdTime: stats.birthtime,
                        modifiedTime: stats.mtime
                    };
                })
                .sort((a, b) => b.createdTime - a.createdTime); // 按时间倒序
            
            return { success: true, backups };
        } catch (error) {
            console.error('获取备份列表失败:', error);
            return { success: false, error: error.message };
        }
    });

    // 恢复备份处理器
    ipcMain.handle('restore-backup', async (event, backupFilePath) => {
        try {
            if (!fs.existsSync(backupFilePath)) {
                return { success: false, error: '备份文件不存在' };
            }
            
            const backupData = fs.readFileSync(backupFilePath, 'utf8');
            const parsedData = JSON.parse(backupData);
            
            // 先创建当前数据的备份
            const currentBackupPath = path.join(app.getPath('userData'), `day-data-before-restore-${Date.now()}.json`);
            if (fs.existsSync(dataPath)) {
                const currentData = fs.readFileSync(dataPath, 'utf8');
                fs.writeFileSync(currentBackupPath, currentData, 'utf8');
            }
            
            // 恢复备份数据
            fs.writeFileSync(dataPath, JSON.stringify(parsedData, null, 2), 'utf8');
            
            console.log('备份恢复成功:', backupFilePath);
            
            return {
                success: true,
                message: '备份恢复成功',
                currentBackupPath
            };
        } catch (error) {
            console.error('恢复备份失败:', error);
            return { success: false, error: error.message };
        }
    });

    // 删除备份处理器
    ipcMain.handle('delete-backup', async (event, backupFilePath) => {
        try {
            if (fs.existsSync(backupFilePath)) {
                fs.unlinkSync(backupFilePath);
                console.log('备份文件已删除:', backupFilePath);
                return { success: true, message: '备份文件已删除' };
            } else {
                return { success: false, error: '备份文件不存在' };
            }
        } catch (error) {
            console.error('删除备份失败:', error);
            return { success: false, error: error.message };
        }
    });

    // 自动备份功能
    function createAutoBackup() {
        try {
            if (!fs.existsSync(dataPath)) {
                console.log('数据文件不存在，跳过自动备份');
                return;
            }

            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `day-auto-backup-${timestamp}.json`;
            const backupDir = path.join(app.getPath('userData'), 'backups', 'auto');
            
            // 确保自动备份目录存在
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            const fullBackupPath = path.join(backupDir, backupFileName);
            const backupData = {
                ...data,
                backupTime: new Date().toISOString(),
                backupType: 'auto',
                version: '1.0.0'
            };
            
            fs.writeFileSync(fullBackupPath, JSON.stringify(backupData, null, 2), 'utf8');
            
            // 清理旧的自动备份（保留最近10个）
            cleanupAutoBackups(backupDir);
            
            console.log('自动备份创建成功:', fullBackupPath);
        } catch (error) {
            console.error('自动备份失败:', error);
        }
    }

    // 清理旧的自动备份
    function cleanupAutoBackups(backupDir) {
        try {
            const files = fs.readdirSync(backupDir);
            const autoBackups = files
                .filter(file => file.startsWith('day-auto-backup-') && file.endsWith('.json'))
                .map(file => ({
                    fileName: file,
                    filePath: path.join(backupDir, file),
                    stats: fs.statSync(path.join(backupDir, file))
                }))
                .sort((a, b) => b.stats.birthtime - a.stats.birthtime);

            // 保留最近10个，删除其余的
            if (autoBackups.length > 10) {
                const toDelete = autoBackups.slice(10);
                toDelete.forEach(backup => {
                    try {
                        fs.unlinkSync(backup.filePath);
                        console.log('已删除旧的自动备份:', backup.fileName);
                    } catch (deleteError) {
                        console.error('删除旧备份失败:', deleteError);
                    }
                });
            }
        } catch (error) {
            console.error('清理自动备份失败:', error);
        }
    }

    // 设置自动备份定时器（每30分钟备份一次）
    const autoBackupInterval = setInterval(() => {
        createAutoBackup();
    }, 30 * 60 * 1000); // 30分钟

    // 应用关闭时清理定时器
    app.on('before-quit', () => {
        if (autoBackupInterval) {
            clearInterval(autoBackupInterval);
        }
    });

    // 立即进行一次自动备份
    setTimeout(() => {
        createAutoBackup();
    }, 5000); // 应用启动5秒后进行第一次备份

    return {
        createAutoBackup,
        cleanupAutoBackups
    };
}

module.exports = {
    initDataPath,
    registerBackupHandlers
}; 