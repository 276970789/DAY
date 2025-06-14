/**
 * 应用程序主入口模块
 * 负责初始化和组装各个组件
 */

/**
 * 初始化应用程序
 */
async function initApp() {
    console.log('正在初始化应用程序...');
    
    try {
        // 1. 加载数据
        const dataLoaded = await loadData();
        if (!dataLoaded) {
            showNotification('警告', '数据加载失败，请检查数据文件是否正确');
        }
        
        // 2. 初始化导航
        initNavigation();
        
        // 3. 初始化任务表单
        initTaskForms();
        
        // 4. 加载保存的主题
        loadSavedTheme();
        
        // 5. 设置全局键盘快捷键
        setupKeyboardShortcuts();
        
        // 6. 初始化拖放事件
        setupDragAndDrop();
        
        console.log('应用程序初始化完成');
    } catch (error) {
        console.error('应用程序初始化失败:', error);
        showNotification('错误', '应用程序初始化失败: ' + (error.message || '未知错误'));
    }
}

/**
 * 设置键盘快捷键
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl+N：新建任务
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            showAddTaskModal();
        }
        
        // Ctrl+1-5：切换视图
        if (event.ctrlKey && event.key >= '1' && event.key <= '5') {
            event.preventDefault();
            const viewIndex = parseInt(event.key) - 1;
            const views = ['dashboard', 'calendar', 'tasks', 'projects', 'diary'];
            if (views[viewIndex]) {
                switchView(views[viewIndex]);
            }
        }
        
        // Esc：关闭模态框
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    // 调用相应的关闭函数
                    if (modal.id === 'addTaskModal') {
                        closeModal();
                    } else if (modal.id === 'editTaskModal') {
                        closeEditModal();
                    }
                }
            });
        }
    });
}

/**
 * 窗口加载完成后初始化应用
 */
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // 绑定快速添加任务按钮
    const quickAddBtn = document.querySelector('.quick-add-btn');
    if (quickAddBtn) {
        quickAddBtn.addEventListener('click', quickAddTask);
    }
    
    // 监听来自主进程的消息
    window.electronAPI.onMessage((event, message) => {
        console.log('收到主进程消息:', message);
        
        if (message.type === 'reload-data') {
            // 重新加载数据
            loadData().then(() => {
                // 刷新当前视图
                const activeView = document.querySelector('.view.active');
                if (activeView) {
                    switchView(activeView.id);
                }
            });
        }
    });
});

// 向控制台输出应用信息
console.log('DAY - 日程管理工具 v1.0.0');
console.log('项目主页: https://github.com/yourusername/day');
console.log('Copyright © 2023-2025 Your Name'); 