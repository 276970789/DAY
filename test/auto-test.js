const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let testWindow;
const dataPath = path.join(app.getPath('userData'), 'planflow-data.json');

console.log('🤖 开始自动化数据持久化测试...');

app.whenReady().then(async () => {
    // 创建测试窗口
    testWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    await testWindow.loadFile('index.html');
    
    console.log('📱 应用加载完成');
    
    // 等待应用初始化
    setTimeout(async () => {
        await runTests();
    }, 2000);
});

async function runTests() {
    console.log('🧪 开始执行测试...');
    
    try {
        // 测试1: 添加任务
        console.log('📝 测试1: 添加任务');
        await testWindow.webContents.executeJavaScript(`
            // 添加测试任务
            const testTask = {
                id: 'auto-test-' + Date.now(),
                title: '自动测试任务',
                description: '这是自动化测试添加的任务',
                status: 'pending',
                dueDate: new Date(),
                priority: 'high'
            };
            appData.tasks.push(testTask);
            saveData();
            console.log('任务添加成功:', testTask.title);
        `);
        
        // 等待保存
        await sleep(1000);
        
        // 测试2: 添加日记
        console.log('📖 测试2: 添加日记');
        await testWindow.webContents.executeJavaScript(`
            // 添加测试日记
            const testDiary = {
                id: 'auto-diary-' + Date.now(),
                date: new Date(),
                title: '自动测试日记',
                content: '这是自动化测试添加的日记，@自动测试任务 很重要',
                mood: '😊',
                weather: '☀️',
                tags: ['自动测试']
            };
            appData.diaries.push(testDiary);
            saveData();
            console.log('日记添加成功:', testDiary.title);
        `);
        
        // 等待保存
        await sleep(1000);
        
        // 测试3: 验证数据文件
        console.log('🔍 测试3: 验证数据文件');
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            console.log('✅ 数据文件存在');
            console.log('📊 数据统计:', {
                tasks: data.appData?.tasks?.length || 0,
                diaries: data.appData?.diaries?.length || 0
            });
            
            if (data.appData?.tasks?.length > 0 && data.appData?.diaries?.length > 0) {
                console.log('🎉 数据持久化测试通过！');
            } else {
                console.log('❌ 数据持久化测试失败：数据为空');
            }
        } else {
            console.log('❌ 数据文件不存在');
        }
        
        // 测试4: 重启测试
        console.log('🔄 测试4: 模拟重启');
        testWindow.reload();
        
        setTimeout(async () => {
            const loadedData = await testWindow.webContents.executeJavaScript(`
                JSON.stringify({
                    tasks: appData.tasks.length,
                    diaries: appData.diaries.length
                })
            `);
            
            const parsed = JSON.parse(loadedData);
            console.log('🔄 重启后数据:', parsed);
            
            if (parsed.tasks > 0 && parsed.diaries > 0) {
                console.log('✅ 重启测试通过！');
            } else {
                console.log('❌ 重启测试失败');
            }
            
            console.log('🏁 测试完成');
            app.quit();
        }, 3000);
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
        app.quit();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.on('window-all-closed', () => {
    app.quit();
}); 