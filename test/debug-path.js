const { app } = require('electron');
const path = require('path');

app.whenReady().then(() => {
    console.log('🔍 调试数据存储路径:');
    console.log('app.getPath("userData"):', app.getPath('userData'));
    console.log('数据文件路径:', path.join(app.getPath('userData'), 'planflow-data.json'));
    
    app.quit();
});

app.on('window-all-closed', () => {
    app.quit();
}); 