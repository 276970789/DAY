/**
 * 任务表单模块 - 处理任务的添加、编辑等表单相关功能
 */

// 当前编辑任务的ID
let currentEditingTaskId = null;

// 表单状态标记
let isAddTaskDirty = false;
let isEditTaskDirty = false;

/**
 * 显示添加任务模态框
 */
function showAddTaskModal() {
    // 重置表单
    document.getElementById('addTaskForm').reset();
    
    // 更新项目下拉列表
    updateProjectDropdown('addTaskProject');
    
    // 默认设置为今天日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('addTaskDueDate').value = today;
    
    // 显示模态框
    document.getElementById('addTaskModal').style.display = 'block';
    
    // 聚焦标题输入框
    document.getElementById('addTaskTitle').focus();
    
    // 重置脏状态
    isAddTaskDirty = false;
}

/**
 * 关闭添加任务模态框
 */
function closeModal() {
    if (isAddTaskDirty && !confirm('您有未保存的更改，确定要关闭吗？')) {
        return;
    }
    document.getElementById('addTaskModal').style.display = 'none';
    isAddTaskDirty = false;
}

/**
 * 更新项目下拉列表
 */
function updateProjectDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // 保留第一个选项（"-- 选择项目（可选）--"）
    const firstOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOption);
    
    // 添加项目选项
    appData.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.title;
        select.appendChild(option);
    });
}

/**
 * 关闭编辑任务模态框
 */
function closeEditModal() {
    if (isEditTaskDirty && !confirm('您有未保存的更改，确定要关闭吗？')) {
        return;
    }
    document.getElementById('editTaskModal').style.display = 'none';
    currentEditingTaskId = null;
    isEditTaskDirty = false;
}

/**
 * 添加新任务
 */
function addTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('addTaskTitle').value.trim();
    if (!title) {
        alert('请输入任务标题');
        return;
    }
    
    const description = document.getElementById('taskDescription').value.trim();
    const dueDateInput = document.getElementById('addTaskDueDate').value;
    const projectId = document.getElementById('addTaskProject').value;
    
    // 创建新任务对象
    const newTask = {
        id: generateId(),
        title,
        description,
        status: 'pending',
        createdAt: new Date(),
        projectId: projectId || null
    };
    
    // 如果有截止日期，转换为Date对象
    if (dueDateInput) {
        newTask.dueDate = new Date(dueDateInput);
    }
    
    // 添加到任务列表
    appData.tasks.push(newTask);
    
    // 保存数据
    saveData();
    
    // 关闭模态框
    document.getElementById('addTaskModal').style.display = 'none';
    
    // 渲染任务列表
    renderTasks();
    
    // 如果需要跳转到相应的视图
    if (newTask.dueDate) {
        // 如果是今天的任务，可以跳转到今日概览
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(newTask.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate.getTime() === today.getTime()) {
            switchView('dashboard');
        }
    }
    
    // 重置脏状态
    isAddTaskDirty = false;
}

/**
 * 更新任务
 */
function updateTask(event) {
    event.preventDefault();
    
    if (!currentEditingTaskId) {
        alert('无效的任务ID');
        return;
    }
    
    const taskIndex = appData.tasks.findIndex(t => t.id === currentEditingTaskId);
    if (taskIndex === -1) {
        alert('找不到要编辑的任务');
        return;
    }
    
    const title = document.getElementById('editTaskTitle').value.trim();
    if (!title) {
        alert('请输入任务标题');
        return;
    }
    
    const description = document.getElementById('editTaskDescription').value.trim();
    const dueDateInput = document.getElementById('editTaskDueDate').value;
    const status = document.getElementById('editTaskStatus').value;
    const projectId = document.getElementById('editTaskProject').value;
    
    // 更新任务对象
    const task = appData.tasks[taskIndex];
    task.title = title;
    task.description = description;
    task.status = status;
    task.projectId = projectId || null;
    task.updatedAt = new Date();
    
    // 更新截止日期
    if (dueDateInput) {
        task.dueDate = new Date(dueDateInput);
    } else {
        task.dueDate = null;
    }
    
    // 保存数据
    saveData();
    
    // 关闭模态框
    document.getElementById('editTaskModal').style.display = 'none';
    currentEditingTaskId = null;
    
    // 渲染任务列表
    renderTasks();
    
    // 重置脏状态
    isEditTaskDirty = false;
}

/**
 * 删除当前正在编辑的任务
 */
function deleteCurrentTask() {
    if (!currentEditingTaskId) {
        alert('无效的任务ID');
        return;
    }
    
    if (confirm('确定要删除这个任务吗？')) {
        const taskIndex = appData.tasks.findIndex(t => t.id === currentEditingTaskId);
        if (taskIndex !== -1) {
            appData.tasks.splice(taskIndex, 1);
            
            // 保存数据
            saveData();
            
            // 关闭模态框
            document.getElementById('editTaskModal').style.display = 'none';
            currentEditingTaskId = null;
            
            // 渲染任务列表
            renderTasks();
        }
    }
}

/**
 * 生成唯一ID
 */
function generateId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

/**
 * 获取项目名称
 */
function getProjectName(projectId) {
    const project = appData.projects.find(p => p.id === projectId);
    return project ? project.title : '未知项目';
}

// 初始化表单
function initTaskForms() {
    // 添加任务表单提交事件
    document.getElementById('addTaskForm').addEventListener('submit', addTask);
    
    // 编辑任务表单提交事件
    document.getElementById('editTaskForm').addEventListener('submit', updateTask);
    
    // 监听表单变化，设置脏状态标记
    document.getElementById('addTaskForm').addEventListener('input', () => isAddTaskDirty = true);
    document.getElementById('editTaskForm').addEventListener('input', () => isEditTaskDirty = true);
}

// 导出函数
window.showAddTaskModal = showAddTaskModal;
window.closeModal = closeModal;
window.closeEditModal = closeEditModal;
window.deleteCurrentTask = deleteCurrentTask;
window.getProjectName = getProjectName;
window.initTaskForms = initTaskForms; 