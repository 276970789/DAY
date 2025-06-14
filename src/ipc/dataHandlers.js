const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// 简单的日志处理函数，避免中文输出到控制台
const log = {
    info: (message) => console.log(`[INFO] ${typeof message === 'string' && message.match(/[\u4e00-\u9fa5]/) ? 'Data operation executed' : message}`),
    warn: (message) => console.warn(`[WARN] ${typeof message === 'string' && message.match(/[\u4e00-\u9fa5]/) ? 'Warning occurred' : message}`),
    error: (message, error) => console.error(`[ERROR] ${error ? (error.message || error) : 'An error occurred'}`)
};

let dataPath;

// 初始化数据路径
function initDataPath(userDataPath) {
    dataPath = path.join(userDataPath, 'day-data.json');
}

// 注册数据相关的IPC处理器
function registerDataHandlers(app) {
    // 数据保存处理器
    ipcMain.handle('save-data', async (event, data) => {
        try {
            log.info('收到保存数据请求:');
            
            // 验证数据完整性
            if (!data || typeof data !== 'object') {
                return { success: false, error: '无效的数据格式' };
            }
            
            // 创建备份
            const backupPath = path.join(app.getPath('userData'), 'day-data-backup.json');
            if (fs.existsSync(dataPath)) {
                try {
                    const currentData = fs.readFileSync(dataPath, 'utf8');
                    fs.writeFileSync(backupPath, currentData, 'utf8');
                    log.info('数据备份已创建');
                } catch (backupError) {
                    log.warn('创建备份失败:', backupError);
                }
            }
            
            // 保存到文件（使用原子写入）
            const tempPath = dataPath + '.tmp';
            const dataString = JSON.stringify(data, null, 2);
            
            fs.writeFileSync(tempPath, dataString, 'utf8');
            
            // 原子性重命名
            fs.renameSync(tempPath, dataPath);
            
            log.info('数据保存成功:');
            
            return { 
                success: true, 
                message: '数据保存成功',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            log.error('保存数据失败:', error);
            return { 
                success: false, 
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    });

    // 数据加载处理器
    ipcMain.handle('load-data', async (event) => {
        try {
            log.info('收到加载数据请求');
            
            if (!fs.existsSync(dataPath)) {
                log.info('数据文件不存在，返回默认数据');
                return { 
                    success: true, 
                    message: '数据文件不存在，使用默认数据',
                    data: {
                        tasks: [],
                        projects: [],
                        diaries: []
                    }
                };
            }
            
            // 检查文件是否可读
            try {
                fs.accessSync(dataPath, fs.constants.R_OK);
            } catch (accessError) {
                log.error('数据文件无法读取:', accessError);
                return { 
                    success: false, 
                    error: '数据文件无法读取',
                    data: null 
                };
            }
            
            const dataString = fs.readFileSync(dataPath, 'utf8');
            
            if (!dataString.trim()) {
                log.info('数据文件为空，返回默认数据');
                return { 
                    success: true, 
                    message: '数据文件为空，使用默认数据',
                    data: {
                        tasks: [],
                        projects: [],
                        diaries: []
                    }
                };
            }
            
            const data = JSON.parse(dataString);
            log.info('数据加载成功:');
            
            return { 
                success: true, 
                data: data,
                message: '数据加载成功',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            log.error('加载数据失败:', error);
            
            // 尝试从备份恢复
            const backupPath = path.join(app.getPath('userData'), 'day-data-backup.json');
            if (fs.existsSync(backupPath)) {
                try {
                    log.info('尝试从备份恢复数据...');
                    const backupData = fs.readFileSync(backupPath, 'utf8');
                    const parsedBackup = JSON.parse(backupData);
                    
                    // 恢复备份到主文件
                    fs.writeFileSync(dataPath, backupData, 'utf8');
                    log.info('从备份恢复数据成功');
                    
                    return { 
                        success: true, 
                        data: parsedBackup,
                        message: '从备份恢复数据成功',
                        timestamp: new Date().toISOString()
                    };
                } catch (backupError) {
                    log.error('备份恢复失败:', backupError);
                }
            }
            
            // 所有恢复方式都失败，返回默认数据
            log.info('所有数据恢复方式都失败，返回默认数据');
            return { 
                success: true, 
                data: {
                    tasks: [],
                    projects: [],
                    diaries: []
                },
                message: '数据恢复失败，使用默认数据',
                timestamp: new Date().toISOString()
            };
        }
    });

    // 数据统计处理器
    ipcMain.handle('get-data-stats', async (event) => {
        try {
            const stats = {
                dataFileExists: fs.existsSync(dataPath),
                dataFileSize: 0,
                backupFileExists: false,
                backupFileSize: 0,
                lastModified: null
            };
            
            if (stats.dataFileExists) {
                const dataStats = fs.statSync(dataPath);
                stats.dataFileSize = dataStats.size;
                stats.lastModified = dataStats.mtime;
            }
            
            const backupPath = path.join(app.getPath('userData'), 'day-data-backup.json');
            if (fs.existsSync(backupPath)) {
                stats.backupFileExists = true;
                const backupStats = fs.statSync(backupPath);
                stats.backupFileSize = backupStats.size;
            }
            
            return { success: true, stats };
        } catch (error) {
            log.error('获取数据统计失败:', error);
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    initDataPath,
    registerDataHandlers
}; 