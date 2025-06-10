const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 使用文件系统代替electron-store
const dataPath = path.join(app.getPath('userData'), 'planflow-data.json');

const store = {
    get: (key, defaultValue) => {
        try {
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                console.log('📖 读取数据:', key, data[key] ? '存在' : '不存在');
                return data[key] !== undefined ? data[key] : defaultValue;
            }
            console.log('📖 数据文件不存在，返回默认值');
            return defaultValue;
        } catch (error) {
            console.error('❌ 读取数据失败:', error);
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            let data = {};
            if (fs.existsSync(dataPath)) {
                data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            }
            data[key] = value;
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
            console.log('✅ 数据保存成功:', key, typeof value === 'object' ? `${Object.keys(value).length} keys` : value);
            console.log('📁 文件路径:', dataPath);
        } catch (error) {
            console.error('❌ 保存数据失败:', error);
        }
    }
};

let mainWindow;

console.log('🔧 调试数据保存功能...');
console.log('📁 数据文件路径:', dataPath);

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
    
    console.log('🚀 应用启动完成');
});

// IPC处理
ipcMain.handle('save-data', async (event, data) => {
    console.log('💾 收到保存请求:', {
        tasks: data.tasks?.length || 0,
        diaries: data.diaries?.length || 0,
        projects: data.projects?.length || 0
    });
    
    try {
        store.set('appData', data);
        console.log('✅ 保存成功');
        return { success: true };
    } catch (error) {
        console.error('❌ 保存失败:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-data', async () => {
    console.log('📥 收到加载请求');
    
    try {
        const data = store.get('appData', {
            tasks: [],
            projects: [],
            diaries: []
        });
        
        console.log('📊 加载的数据:', {
            tasks: data.tasks?.length || 0,
            diaries: data.diaries?.length || 0,
            projects: data.projects?.length || 0
        });
        
        return { success: true, data };
    } catch (error) {
        console.error('❌ 加载失败:', error);
        return { success: false, error: error.message };
    }
});

app.on('window-all-closed', () => {
    app.quit();
}); 