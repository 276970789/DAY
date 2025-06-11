const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    // 设置应用名称以确保正确的userData路径
    app.setName('day');
    
    // 数据存储路径
    const dataPath = path.join(app.getPath('userData'), 'day-data.json');
    const backupPath = path.join(app.getPath('userData'), 'day-data-backup.json');
    
    console.log('=== DAY数据存储诊断工具 ===');
    console.log('数据存储路径:', dataPath);
    console.log('备份存储路径:', backupPath);
    
    function testDataStorage() {
        console.log('\n📊 开始数据诊断...');
        
        // 检查数据文件是否存在
        if (fs.existsSync(dataPath)) {
            console.log('✅ 主数据文件存在');
            try {
                const data = fs.readFileSync(dataPath, 'utf8');
                const parsedData = JSON.parse(data);
                console.log('✅ 数据文件可正常读取');
                console.log('📋 数据内容摘要:', {
                    任务数量: parsedData.tasks ? parsedData.tasks.length : 0,
                    项目数量: parsedData.projects ? parsedData.projects.length : 0,
                    日记数量: parsedData.diaries ? parsedData.diaries.length : 0,
                    主题设置: parsedData.theme || '未设置',
                    文件大小: (data.length / 1024).toFixed(2) + 'KB'
                });
                
                // 检查数据结构
                console.log('\n🔍 详细数据检查:');
                if (parsedData.tasks) {
                    console.log('任务列表:', parsedData.tasks.map(t => ({
                        id: t.id,
                        标题: t.title,
                        状态: t.status,
                        创建时间: new Date(parseInt(t.id)).toLocaleString('zh-CN')
                    })));
                }
            } catch (error) {
                console.error('❌ 数据文件损坏:', error.message);
            }
        } else {
            console.log('⚠️ 主数据文件不存在');
        }
        
        // 检查备份文件
        if (fs.existsSync(backupPath)) {
            console.log('✅ 备份文件存在');
            try {
                const backupData = fs.readFileSync(backupPath, 'utf8');
                const parsedBackup = JSON.parse(backupData);
                console.log('✅ 备份文件可正常读取');
                console.log('📋 备份数据摘要:', {
                    任务数量: parsedBackup.tasks ? parsedBackup.tasks.length : 0,
                    项目数量: parsedBackup.projects ? parsedBackup.projects.length : 0,
                    日记数量: parsedBackup.diaries ? parsedBackup.diaries.length : 0,
                    主题设置: parsedBackup.theme || '未设置'
                });
            } catch (error) {
                console.error('❌ 备份文件损坏:', error.message);
            }
        } else {
            console.log('⚠️ 备份文件不存在');
        }
        
        console.log('\n=== 诊断完成 ===');
    }
    
    function createTestData() {
        console.log('\n🧪 创建测试数据...');
        
        const testData = {
            tasks: [
                {
                    id: Date.now().toString(),
                    title: '测试任务1 - 数据持久化测试',
                    description: '这是一个测试任务，用来验证数据是否能正确保存和加载',
                    status: 'pending',
                    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: (Date.now() + 1).toString(),
                    title: '测试任务2 - 重启后数据保持',
                    description: '验证应用重启后数据是否仍然存在',
                    status: 'pending',
                    dueDate: null
                }
            ],
            projects: [],
            diaries: [],
            theme: 'blue'
        };
        
        try {
            // 创建备份
            if (fs.existsSync(dataPath)) {
                const currentData = fs.readFileSync(dataPath, 'utf8');
                fs.writeFileSync(backupPath, currentData, 'utf8');
                console.log('✅ 当前数据已备份');
            }
            
            // 原子写入
            const tempPath = dataPath + '.tmp';
            const dataString = JSON.stringify(testData, null, 2);
            fs.writeFileSync(tempPath, dataString, 'utf8');
            fs.renameSync(tempPath, dataPath);
            
            console.log('✅ 测试数据已创建');
            console.log('📋 测试数据内容:', {
                任务数量: testData.tasks.length,
                主题设置: testData.theme
            });
            
        } catch (error) {
            console.error('❌ 创建测试数据失败:', error.message);
        }
    }
    
    app.whenReady().then(() => {
        console.log('\n🚀 DAY数据诊断工具启动完成');
        
        // 运行诊断
        testDataStorage();
        
        // 询问是否创建测试数据
        console.log('\n❓ 是否需要创建测试数据？(5秒后自动退出)');
        console.log('如需创建测试数据，请重新运行: node test-data.js --create-test');
        
        if (process.argv.includes('--create-test')) {
            createTestData();
            console.log('\n✅ 测试数据创建完成，现在可以启动DAY应用测试数据持久化');
        }
        
        // 5秒后退出
        setTimeout(() => {
            console.log('\n👋 诊断工具结束');
            app.quit();
        }, 5000);
    });
    
    app.on('window-all-closed', () => {
        app.quit();
    });
} 