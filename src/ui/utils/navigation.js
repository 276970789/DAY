/**
 * 导航和视图切换模块
 */

/**
 * 切换视图
 * @param {string} viewId - 要显示的视图ID
 */
function switchView(viewId) {
    // 隐藏所有视图
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // 显示选中的视图
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
        
        // 更新活动链接状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // 根据视图类型渲染不同内容
        if (viewId === 'dashboard') renderDashboard();
        else if (viewId === 'calendar') renderCalendar();
        else if (viewId === 'tasks') renderTasks();
        else if (viewId === 'projects') renderProjects();
        else if (viewId === 'diary') renderDiaries();
        else if (viewId === 'backup') renderBackupView();
    }
}

/**
 * 初始化导航事件
 */
function initNavigation() {
    // 绑定导航链接点击事件
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const viewId = this.getAttribute('data-view');
            if (viewId) {
                switchView(viewId);
            }
        });
    });
    
    // 默认显示仪表盘视图
    switchView('dashboard');
    
    // 绑定主题切换事件
    document.querySelectorAll('.theme-button').forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            changeTheme(theme);
        });
    });
}

/**
 * 更改主题
 * @param {string} theme - 主题名称（blue, orange, green, purple, red）
 */
function changeTheme(theme) {
    // 移除所有主题类
    document.body.classList.remove(
        'theme-blue-mode',
        'theme-orange-mode',
        'theme-green-mode',
        'theme-purple-mode',
        'theme-red-mode'
    );
    
    // 添加新主题类
    if (theme !== 'blue') { // 蓝色是默认主题
        document.body.classList.add(`theme-${theme}-mode`);
    }
    
    // 更新主题按钮状态
    document.querySelectorAll('.theme-button').forEach(button => {
        button.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`.theme-button[data-theme="${theme}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 保存主题选择到本地存储
    localStorage.setItem('theme', theme);
}

/**
 * 加载保存的主题
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
}

/**
 * 快速添加任务
 */
function quickAddTask() {
    // 切换到任务视图
    switchView('tasks');
    
    // 显示添加任务模态框
    setTimeout(() => {
        showAddTaskModal();
    }, 100);
}

// 导出函数
window.switchView = switchView;
window.initNavigation = initNavigation;
window.changeTheme = changeTheme;
window.quickAddTask = quickAddTask; 