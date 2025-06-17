/**
 * 数据处理工具模块
 */

// 应用数据对象
let appData = {
    tasks: [],
    projects: [],
    diaries: [],
    settings: {
        theme: 'blue',
        notifications: true,
        showSuggestedTasks: true  // 控制是否显示建议任务
    }
};

/**
 * 加载数据
 */
async function loadData() {
    try {
        // 从主进程获取数据 - 支持两种方法名
        let result;
        if (typeof window.electronAPI.loadData === 'function') {
            result = await window.electronAPI.loadData();
        } else if (typeof window.electronAPI.getData === 'function') {
            result = await window.electronAPI.getData();
        } else {
            console.error('无法找到有效的数据加载方法');
            return false;
        }
        
        if (result.success) {
            // 解析日期字段
            const data = result.data;
            
            // 处理任务的日期字段
            if (data.tasks) {
                data.tasks.forEach(task => {
                    if (task.dueDate) {
                        task.dueDate = new Date(task.dueDate);
                    }
                    if (task.createdAt) {
                        task.createdAt = new Date(task.createdAt);
                    }
                    if (task.updatedAt) {
                        task.updatedAt = new Date(task.updatedAt);
                    }
                });
            }
            
            // 处理项目的日期字段
            if (data.projects) {
                data.projects.forEach(project => {
                    if (project.createdAt) {
                        project.createdAt = new Date(project.createdAt);
                    }
                    if (project.updatedAt) {
                        project.updatedAt = new Date(project.updatedAt);
                    }
                });
            }
            
            // 处理日记的日期字段
            if (data.diaries) {
                data.diaries.forEach(diary => {
                    if (diary.date) {
                        diary.date = new Date(diary.date);
                    }
                    if (diary.createdAt) {
                        diary.createdAt = new Date(diary.createdAt);
                    }
                    if (diary.updatedAt) {
                        diary.updatedAt = new Date(diary.updatedAt);
                    }
                });
            }
            
            // 恢复主题设置
            if (data.theme && typeof changeTheme === 'function') {
                changeTheme(data.theme, true);
            }
            
            // 确保设置对象存在并设置默认值
            if (!data.settings) {
                data.settings = {};
            }
            if (data.settings.showSuggestedTasks === undefined) {
                data.settings.showSuggestedTasks = true;
            }
            
            // 更新应用数据
            appData = data;
            
            console.log('数据加载成功:', appData);
            return true;
        } else {
            // 获取数据失败
            console.error('加载数据失败:', result.error);
            showNotification('数据加载失败', result.error || '未知错误');
            return false;
        }
    } catch (error) {
        console.error('加载数据异常:', error);
        showNotification('数据加载异常', error.message || '未知错误');
        return false;
    }
}

/**
 * 保存数据
 */
async function saveData() {
    try {
        // 增加主题保存
        const dataToSave = {
            ...appData,
            theme: window.currentTheme || 'blue' // 保存当前主题
        };
        
        const result = await window.electronAPI.saveData(dataToSave);
        
        if (result.success) {
            console.log('数据保存成功');
            return true;
        } else {
            console.error('保存数据失败:', result.error);
            showNotification('保存数据失败', result.error || '未知错误');
            return false;
        }
    } catch (error) {
        console.error('保存数据异常:', error);
        showNotification('保存数据异常', error.message || '未知错误');
        return false;
    }
}

/**
 * 显示通知
 */
function showNotification(title, message) {
    // 检查是否有通知API
    if (window.electronAPI && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, message);
    } else {
        // 回退到浏览器通知或警告框
        if ("Notification" in window) {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    new Notification(title, { body: message });
                }
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

/**
 * 获取指定日期的任务
 */
function getTasksForDate(date) {
    if (!appData.tasks) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return appData.tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = task.dueDate.toISOString().split('T')[0];
        return taskDate === dateString;
    });
}

/**
 * 获取指定项目的任务
 */
function getTasksForProject(projectId) {
    if (!appData.tasks) return [];
    
    return appData.tasks.filter(task => task.projectId === projectId);
}

/**
 * 检查对象是否有修改
 * @param {Object} obj1 - 对象1
 * @param {Object} obj2 - 对象2
 * @returns {boolean} - 是否有修改
 */
function hasChanges(obj1, obj2) {
    return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

// 导出函数和变量
window.appData = appData;
window.loadData = loadData;
window.saveData = saveData;
window.showNotification = showNotification;
window.getTasksForDate = getTasksForDate;
window.getTasksForProject = getTasksForProject; 