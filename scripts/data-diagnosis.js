/**
 * DAY应用数据诊断工具
 * 用于检查和修复数据存储问题
 */
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// 获取相关路径
const userDataPath = app.getPath('userData');
const dataPath = path.join(userDataPath, 'day-data.json');
const backupPath = path.join(userDataPath, 'day-data-backup.json');
const autoBackupDir = path.join(userDataPath, 'backups', 'auto');

// 清晰的命令行显示
function logHeader(title) {
    console.log('\n=========================================');
    console.log(`  ${title}`);
    console.log('=========================================');
}

function logResult(label, value, isError = false) {
    if (isError) {
        console.error(`❌ ${label}: ${value}`);
    } else {
        console.log(`✅ ${label}: ${value}`);
    }
}

/**
 * 检查数据文件
 */
function checkDataFiles() {
    logHeader('检查数据文件');
    
    // 检查用户数据目录
    console.log(`用户数据目录: ${userDataPath}`);
    
    // 检查主数据文件
    if (fs.existsSync(dataPath)) {
        try {
            const stats = fs.statSync(dataPath);
            logResult('主数据文件', `存在，大小: ${formatSize(stats.size)}`);
            
            // 检查内容格式
            const content = fs.readFileSync(dataPath, 'utf8');
            try {
                const data = JSON.parse(content);
                logResult('数据格式', '有效的JSON');
                
                // 检查数据结构
                if (data.tasks && Array.isArray(data.tasks)) {
                    logResult('任务数量', data.tasks.length);
                }
                if (data.projects && Array.isArray(data.projects)) {
                    logResult('项目数量', data.projects.length);
                }
                if (data.diaries && Array.isArray(data.diaries)) {
                    logResult('日记数量', data.diaries.length);
                }
            } catch (error) {
                logResult('数据格式', `无效的JSON: ${error.message}`, true);
            }
        } catch (error) {
            logResult('主数据文件', `无法读取: ${error.message}`, true);
        }
    } else {
        logResult('主数据文件', '不存在', true);
    }
    
    // 检查备份文件
    if (fs.existsSync(backupPath)) {
        try {
            const stats = fs.statSync(backupPath);
            logResult('备份数据文件', `存在，大小: ${formatSize(stats.size)}`);
        } catch (error) {
            logResult('备份数据文件', `无法读取: ${error.message}`, true);
        }
    } else {
        logResult('备份数据文件', '不存在', true);
    }
    
    // 检查自动备份目录
    if (fs.existsSync(autoBackupDir)) {
        try {
            const files = fs.readdirSync(autoBackupDir);
            const backups = files.filter(file => file.startsWith('day-auto-backup-') && file.endsWith('.json'));
            logResult('自动备份', `存在 ${backups.length} 个自动备份`);
        } catch (error) {
            logResult('自动备份', `无法读取目录: ${error.message}`, true);
        }
    } else {
        logResult('自动备份', '目录不存在', true);
    }
}

/**
 * 创建测试数据
 */
function createTestData() {
    logHeader('创建测试数据');
    
    const testData = {
        tasks: [
            {
                id: '1',
                title: '测试任务1',
                completed: false,
                createdAt: new Date().toISOString(),
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                title: '测试任务2',
                completed: true,
                createdAt: new Date().toISOString(),
                dueDate: new Date().toISOString()
            }
        ],
        projects: [
            {
                id: '1',
                name: '测试项目',
                createdAt: new Date().toISOString()
            }
        ],
        diaries: [
            {
                id: '1',
                title: '测试日记',
                content: '这是一个测试日记内容',
                date: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }
        ],
        theme: 'blue'
    };
    
    try {
        // 创建备份目录
        if (!fs.existsSync(path.dirname(backupPath))) {
            fs.mkdirSync(path.dirname(backupPath), { recursive: true });
        }
        
        // 备份现有数据（如果存在）
        if (fs.existsSync(dataPath)) {
            const backupName = `day-data-before-test-${Date.now()}.json`;
            const testBackupPath = path.join(userDataPath, backupName);
            fs.copyFileSync(dataPath, testBackupPath);
            logResult('备份原始数据', `成功: ${backupName}`);
        }
        
        // 写入测试数据
        fs.writeFileSync(dataPath, JSON.stringify(testData, null, 2), 'utf8');
        logResult('写入测试数据', '成功');
        
        // 创建备份数据
        fs.writeFileSync(backupPath, JSON.stringify(testData, null, 2), 'utf8');
        logResult('创建备份数据', '成功');
    } catch (error) {
        logResult('创建测试数据', `失败: ${error.message}`, true);
    }
}

/**
 * 修复数据存储问题
 */
function fixDataIssues() {
    logHeader('修复数据存储问题');
    
    try {
        // 检查数据目录是否存在
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            logResult('创建数据目录', '成功');
        }
        
        // 如果主数据文件不存在但备份存在，恢复备份
        if (!fs.existsSync(dataPath) && fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, dataPath);
            logResult('从备份恢复数据', '成功');
        }
        
        // 检查数据格式
        if (fs.existsSync(dataPath)) {
            try {
                const content = fs.readFileSync(dataPath, 'utf8');
                JSON.parse(content); // 测试是否为有效JSON
                logResult('数据格式检查', '通过');
            } catch (error) {
                // 数据文件损坏，创建默认数据
                const defaultData = {
                    tasks: [],
                    projects: [],
                    diaries: [],
                    theme: 'blue'
                };
                fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2), 'utf8');
                logResult('修复损坏的数据文件', '成功');
            }
        } else {
            // 创建默认数据文件
            const defaultData = {
                tasks: [],
                projects: [],
                diaries: [],
                theme: 'blue'
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2), 'utf8');
            logResult('创建默认数据文件', '成功');
        }
        
        // 创建备份目录
        const backupDir = path.join(userDataPath, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            logResult('创建备份目录', '成功');
        }
        
        // 创建自动备份目录
        if (!fs.existsSync(autoBackupDir)) {
            fs.mkdirSync(autoBackupDir, { recursive: true });
            logResult('创建自动备份目录', '成功');
        }
    } catch (error) {
        logResult('修复数据问题', `失败: ${error.message}`, true);
    }
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * 主函数
 */
function main() {
    console.log('DAY应用数据诊断工具启动');
    console.log(`时间: ${new Date().toLocaleString()}`);
    console.log(`Electron版本: ${process.versions.electron}`);
    console.log(`Node版本: ${process.versions.node}`);
    
    // 执行诊断步骤
    checkDataFiles();
    
    // 根据命令行参数执行不同操作
    const args = process.argv.slice(2);
    if (args.includes('--fix')) {
        fixDataIssues();
    }
    if (args.includes('--create-test-data')) {
        createTestData();
    }
    
    console.log('\n诊断完成');
}

// 启动应用但不创建窗口
app.on('ready', () => {
    main();
    // 完成后退出
    setTimeout(() => {
        app.quit();
    }, 1000);
});

// 防止app ready事件多次触发
app.on('window-all-closed', () => {
    app.quit();
}); 