const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    // 设置应用名称确保正确路径
    app.setName('day');
    
    // 数据存储路径
    const correctDataPath = path.join(app.getPath('userData'), 'day-data.json');
    const correctBackupPath = path.join(app.getPath('userData'), 'day-data-backup.json');
    
    // 错误的路径（Electron默认路径）
    const wrongDataPath = path.join(app.getPath('userData').replace('day', 'Electron'), 'day-data.json');
    const wrongBackupPath = path.join(app.getPath('userData').replace('day', 'Electron'), 'day-data-backup.json');
    
    console.log('=== DAY数据存储修复工具 ===');
    console.log('正确数据路径:', correctDataPath);
    console.log('错误数据路径:', wrongDataPath);
    
    function migrateAndFixData() {
        console.log('\n🔧 开始数据修复和迁移...');
        
        let finalData = {
            tasks: [],
            projects: [],
            diaries: [],
            theme: 'blue'
        };
        
        // 1. 检查错误路径的数据
        if (fs.existsSync(wrongDataPath)) {
            try {
                console.log('📦 发现错误路径的数据，准备迁移...');
                const wrongData = JSON.parse(fs.readFileSync(wrongDataPath, 'utf8'));
                console.log('错误路径数据:', {
                    任务数量: wrongData.tasks ? wrongData.tasks.length : 0,
                    项目数量: wrongData.projects ? wrongData.projects.length : 0,
                    日记数量: wrongData.diaries ? wrongData.diaries.length : 0,
                    主题: wrongData.theme || '未设置'
                });
                
                // 合并数据
                if (wrongData.tasks && wrongData.tasks.length > 0) {
                    finalData.tasks = [...finalData.tasks, ...wrongData.tasks];
                }
                if (wrongData.projects && wrongData.projects.length > 0) {
                    finalData.projects = [...finalData.projects, ...wrongData.projects];
                }
                if (wrongData.diaries && wrongData.diaries.length > 0) {
                    finalData.diaries = [...finalData.diaries, ...wrongData.diaries];
                }
                if (wrongData.theme) {
                    finalData.theme = wrongData.theme;
                }
                
                console.log('✅ 错误路径数据已读取');
            } catch (error) {
                console.error('❌ 读取错误路径数据失败:', error.message);
            }
        }
        
        // 2. 检查正确路径是否已有数据
        if (fs.existsSync(correctDataPath)) {
            try {
                console.log('📦 发现正确路径的现有数据...');
                const correctData = JSON.parse(fs.readFileSync(correctDataPath, 'utf8'));
                console.log('正确路径数据:', {
                    任务数量: correctData.tasks ? correctData.tasks.length : 0,
                    项目数量: correctData.projects ? correctData.projects.length : 0,
                    日记数量: correctData.diaries ? correctData.diaries.length : 0,
                    主题: correctData.theme || '未设置'
                });
                
                // 合并去重（优先保留正确路径的数据）
                const taskIds = new Set(correctData.tasks ? correctData.tasks.map(t => t.id) : []);
                const projectIds = new Set(correctData.projects ? correctData.projects.map(p => p.id) : []);
                const diaryIds = new Set(correctData.diaries ? correctData.diaries.map(d => d.id) : []);
                
                // 合并任务（去重）
                if (correctData.tasks) {
                    finalData.tasks = [...correctData.tasks];
                }
                finalData.tasks.push(...(finalData.tasks.filter(t => !taskIds.has(t.id))));
                
                // 合并项目（去重）
                if (correctData.projects) {
                    finalData.projects = [...correctData.projects];
                }
                finalData.projects.push(...(finalData.projects.filter(p => !projectIds.has(p.id))));
                
                // 合并日记（去重）
                if (correctData.diaries) {
                    finalData.diaries = [...correctData.diaries];
                }
                finalData.diaries.push(...(finalData.diaries.filter(d => !diaryIds.has(d.id))));
                
                // 主题优先用正确路径的
                if (correctData.theme) {
                    finalData.theme = correctData.theme;
                }
                
                console.log('✅ 正确路径数据已合并');
            } catch (error) {
                console.error('❌ 读取正确路径数据失败:', error.message);
            }
        }
        
        // 3. 确保正确路径的目录存在
        const correctDir = path.dirname(correctDataPath);
        if (!fs.existsSync(correctDir)) {
            fs.mkdirSync(correctDir, { recursive: true });
            console.log('✅ 创建了正确的数据目录');
        }
        
        // 4. 保存合并后的数据到正确路径
        try {
            // 创建备份
            if (fs.existsSync(correctDataPath)) {
                const currentData = fs.readFileSync(correctDataPath, 'utf8');
                fs.writeFileSync(correctBackupPath, currentData, 'utf8');
                console.log('✅ 当前数据已备份');
            }
            
            // 原子写入
            const tempPath = correctDataPath + '.tmp';
            const dataString = JSON.stringify(finalData, null, 2);
            fs.writeFileSync(tempPath, dataString, 'utf8');
            fs.renameSync(tempPath, correctDataPath);
            
            console.log('✅ 数据已保存到正确路径');
            console.log('📊 最终数据摘要:', {
                任务数量: finalData.tasks.length,
                项目数量: finalData.projects.length,
                日记数量: finalData.diaries.length,
                主题: finalData.theme,
                文件大小: (dataString.length / 1024).toFixed(2) + 'KB'
            });
            
        } catch (error) {
            console.error('❌ 保存数据失败:', error.message);
            return false;
        }
        
        // 5. 清理错误路径的文件（可选）
        if (fs.existsSync(wrongDataPath)) {
            try {
                fs.unlinkSync(wrongDataPath);
                console.log('🗑️ 已删除错误路径的数据文件');
            } catch (error) {
                console.warn('⚠️ 删除错误路径文件失败:', error.message);
            }
        }
        
        if (fs.existsSync(wrongBackupPath)) {
            try {
                fs.unlinkSync(wrongBackupPath);
                console.log('🗑️ 已删除错误路径的备份文件');
            } catch (error) {
                console.warn('⚠️ 删除错误路径备份文件失败:', error.message);
            }
        }
        
        console.log('\n✅ 数据修复和迁移完成！');
        return true;
    }
    
    function generateFixedRendererCode() {
        console.log('\n🔧 生成修复后的前端代码...');
        
        const fixedCode = `
        // 简化数据存储 - 只使用Electron存储（修复版）
        async function saveData() {
            try {
                const dataToSave = {
                    ...appData,
                    theme: currentTheme // 保存当前主题
                };
                
                if (isElectron) {
                    const result = await window.electronAPI.saveData(dataToSave);
                    if (result && result.success) {
                        console.log('✅ 数据保存成功');
                    } else {
                        console.error('❌ 保存失败:', result ? result.error : '未知错误');
                    }
                } else {
                    console.warn('⚠️ 非Electron环境，无法保存数据');
                }
            } catch (error) {
                console.error('❌ 保存失败:', error);
            }
        }

        // 简化的数据加载 - 只使用Electron存储（修复版）
        async function loadData() {
            try {
                let savedData = null;
                
                if (isElectron) {
                    const result = await window.electronAPI.loadData();
                    if (result.success && result.data) {
                        savedData = result.data;
                        console.log('✅ 数据加载成功:', savedData);
                    } else {
                        console.log('⚠️ 没有保存的数据，使用默认数据');
                    }
                } else {
                    console.warn('⚠️ 非Electron环境，无法加载数据');
                }

                if (savedData) {
                    // 恢复主题设置
                    if (savedData.theme) {
                        changeTheme(savedData.theme);
                    }

                    // 恢复应用数据
                    appData = {
                        tasks: savedData.tasks || [],
                        projects: savedData.projects || [],
                        diaries: savedData.diaries || []
                    };
                    
                    // 转换日期字符串为Date对象
                    appData.tasks.forEach(task => {
                        if (task.dueDate) task.dueDate = new Date(task.dueDate);
                    });
                    appData.diaries.forEach(diary => {
                        if (diary.date) diary.date = new Date(diary.date);
                    });
                }
            } catch (error) {
                console.error('❌ 加载失败:', error);
                console.log('使用默认数据结构');
            }
        }

        // 移除主题从localStorage加载的函数
        function loadThemeFromStorage() {
            // 主题设置现在通过loadData()统一处理
            console.log('主题设置通过统一数据加载');
        }
        `;
        
        console.log('💾 修复代码已生成，请手动替换renderer-simple.html中对应的函数');
        console.log('\n📝 需要替换的函数:');
        console.log('1. saveData()');
        console.log('2. loadData()');  
        console.log('3. loadThemeFromStorage()');
    }
    
    app.whenReady().then(() => {
        console.log('\n🚀 DAY数据存储修复工具启动');
        
        // 执行修复
        const success = migrateAndFixData();
        
        if (success) {
            generateFixedRendererCode();
            console.log('\n✅ 修复完成！现在请：');
            console.log('1. 手动更新renderer-simple.html中的存储函数');
            console.log('2. 重启DAY应用');
            console.log('3. 测试数据持久化');
        }
        
        // 5秒后退出
        setTimeout(() => {
            console.log('\n👋 修复工具结束');
            app.quit();
        }, 8000);
    });
    
    app.on('window-all-closed', () => {
        app.quit();
    });
} 