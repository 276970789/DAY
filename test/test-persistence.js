const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

console.log('🧪 开始数据持久化测试...');

// 获取数据文件路径
const dataPath = path.join(app.getPath('userData'), 'planflow-data.json');
console.log('📁 数据文件路径:', dataPath);

// 测试数据
const testData = {
    tasks: [
        {
            id: 'test-task-1',
            title: '测试任务1',
            description: '这是一个测试任务',
            status: 'pending',
            dueDate: new Date('2024-12-15'),
            priority: 'high'
        },
        {
            id: 'test-task-2', 
            title: '测试任务2',
            description: '另一个测试任务',
            status: 'completed',
            dueDate: new Date('2024-12-16'),
            priority: 'medium'
        }
    ],
    projects: [],
    diaries: [
        {
            id: 'test-diary-1',
            date: new Date('2024-12-15'),
            title: '测试日记',
            content: '今天测试了数据持久化功能，希望能够正常工作。@测试任务1',
            mood: '😊',
            weather: '☀️',
            tags: ['测试', '开发']
        }
    ]
};

async function testPersistence() {
    try {
        // 1. 清理现有数据
        if (fs.existsSync(dataPath)) {
            fs.unlinkSync(dataPath);
            console.log('🗑️ 清理现有数据文件');
        }

        // 2. 写入测试数据
        fs.writeFileSync(dataPath, JSON.stringify(testData, null, 2), 'utf8');
        console.log('✅ 测试数据写入成功');

        // 3. 读取数据验证
        const readData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log('📖 读取的数据:', {
            tasks: readData.tasks.length,
            diaries: readData.diaries.length
        });

        // 4. 验证数据完整性
        const tasksMatch = readData.tasks.length === testData.tasks.length;
        const diariesMatch = readData.diaries.length === testData.diaries.length;
        
        if (tasksMatch && diariesMatch) {
            console.log('✅ 数据完整性验证通过');
            return true;
        } else {
            console.log('❌ 数据完整性验证失败');
            return false;
        }

    } catch (error) {
        console.error('❌ 测试失败:', error);
        return false;
    }
}

app.whenReady().then(async () => {
    console.log('🚀 应用准备就绪');
    
    const result = await testPersistence();
    
    if (result) {
        console.log('🎉 数据持久化测试通过！');
    } else {
        console.log('💥 数据持久化测试失败！');
    }
    
    // 等待一秒后退出
    setTimeout(() => {
        app.quit();
    }, 1000);
});

app.on('window-all-closed', () => {
    app.quit();
}); 