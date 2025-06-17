/**
 * 任务列表模块 - 处理任务的显示、排序、拖拽等功能
 */

// 拖拽相关的状态变量
let draggedTaskId = null;

/**
 * 渲染任务列表，将任务分为有日期和无日期两组
 */
function renderTasks() {
    // 1. 将任务分为有日期和无日期两组
    const datedTasks = appData.tasks.filter(t => t.dueDate);
    const undatedTasks = appData.tasks.filter(t => !t.dueDate);

    // 2. 对有日期的任务按日期升序排序
    datedTasks.sort((a, b) => {
        // 确保日期是Date对象
        const dateA = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
        const dateB = b.dueDate instanceof Date ? b.dueDate : new Date(b.dueDate);
        
        // 首先按日期排序
        const dateCompare = dateA.getTime() - dateB.getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // 日期相同时，按状态排序（未完成的优先）
        if (a.status !== b.status) {
            return a.status === 'pending' ? -1 : 1;
        }
        
        // 最后按ID排序（新创建的在前）
        return parseInt(b.id) - parseInt(a.id);
    });
    
    // 3. 获取两个列表的容器
    const datedListContainer = document.getElementById('dated-task-list');
    const undatedListContainer = document.getElementById('undated-task-list');
    
    // 4. 按日期分组任务
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的0点
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // 分组任务
    const todayTasks = [];
    const tomorrowTasks = [];
    const thisWeekTasks = [];
    const futureTasks = [];
    const overdueTasks = [];
    
    datedTasks.forEach(task => {
        const taskDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0); // 设置为当天的0点
        
        if (taskDate < today) {
            overdueTasks.push(task);
        } else if (taskDate.getTime() === today.getTime()) {
            todayTasks.push(task);
        } else if (taskDate.getTime() === tomorrow.getTime()) {
            tomorrowTasks.push(task);
        } else if (taskDate < nextWeek) {
            thisWeekTasks.push(task);
        } else {
            futureTasks.push(task);
        }
    });
    
    // 5. 更新任务计数
    document.getElementById('dated-task-count').textContent = `${datedTasks.length}个任务`;
    document.getElementById('undated-task-count').textContent = `${undatedTasks.length}个任务`;
    
    // 更新分组计数
    document.querySelector('#today-tasks .group-count').textContent = `${todayTasks.length}个任务`;
    document.querySelector('#tomorrow-tasks .group-count').textContent = `${tomorrowTasks.length}个任务`;
    document.querySelector('#this-week-tasks .group-count').textContent = `${thisWeekTasks.length}个任务`;
    document.querySelector('#future-tasks .group-count').textContent = `${futureTasks.length}个任务`;
    document.querySelector('#overdue-tasks .group-count').textContent = `${overdueTasks.length}个任务`;
    
    // 6. 渲染各分组任务
    const renderTaskGroup = (tasks, containerId) => {
        const container = document.querySelector(`#${containerId} + div`) || document.querySelector(`#${containerId}`);
        if (!container) return;
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无任务</div>';
            return;
        }
        
        const tasksHtml = tasks.map(task => {
            const description = task.description ? renderMarkdown(task.description) : '';
            const dateString = task.dueDate instanceof Date 
                ? task.dueDate.toLocaleDateString('zh-CN') 
                : new Date(task.dueDate).toLocaleDateString('zh-CN');
            
            // 构建复选框或脉冲符号的HTML
            let checkboxOrProgress = '';
            if (task.status === 'in-progress') {
                checkboxOrProgress = '<div class="task-progress-icon"></div>';
            } else {
                checkboxOrProgress = `<input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} onclick="toggleTask('${task.id}')">`;
            }
                
            return `
                <div class="task-item ${task.status === 'completed' ? 'completed' : ''} ${task.status === 'in-progress' ? 'in-progress' : ''}" 
                     data-task-id="${task.id}">
                    <div class="task-drag-handle" title="拖拽排序">⋮⋮</div>
                    ${checkboxOrProgress}
                    <div style="flex: 1;">
                        <span class="task-title" onclick="editTask('${task.id}')" title="点击编辑任务">
                            ${task.title} 
                            ${containerId !== 'today-tasks' && containerId !== 'tomorrow-tasks' ? `<span class="task-date">📅 ${dateString}</span>` : ''}
                            ${task.projectId ? `<span class="task-project">📋 ${getProjectName(task.projectId)}</span>` : ''}
                        </span>
                        ${description ? `<div class="task-description">${description}</div>` : ''}
                    </div>
                    <button onclick="deleteTask('${task.id}')" class="delete-btn">删除</button>
                </div>
            `;
        }).join('');
        
        container.innerHTML = tasksHtml;
    };
    
    // 渲染各组任务
    renderTaskGroup(todayTasks, 'today-tasks');
    renderTaskGroup(tomorrowTasks, 'tomorrow-tasks');
    renderTaskGroup(thisWeekTasks, 'this-week-tasks');
    renderTaskGroup(futureTasks, 'future-tasks');
    renderTaskGroup(overdueTasks, 'overdue-tasks');
    
    // 7. 渲染无日期的任务 (可拖拽)
    if (undatedTasks.length === 0) {
        undatedListContainer.innerHTML = '<div class="empty-state">暂无未安排日期的任务</div>';
    } else {
        const undatedHtml = undatedTasks.map(task => {
            const description = task.description ? renderMarkdown(task.description) : '';
            
            // 构建复选框或脉冲符号的HTML
            let checkboxOrProgress = '';
            if (task.status === 'in-progress') {
                checkboxOrProgress = '<div class="task-progress-icon"></div>';
            } else {
                checkboxOrProgress = `<input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} onclick="toggleTask('${task.id}')">`;
            }
            
            return `
                <div class="task-item ${task.status === 'completed' ? 'completed' : ''} ${task.status === 'in-progress' ? 'in-progress' : ''}" 
                     draggable="true" 
                     data-task-id="${task.id}">
                    <div class="task-drag-handle" title="拖拽排序">⋮⋮</div>
                    ${checkboxOrProgress}
                    <div style="flex: 1;">
                        <span class="task-title" onclick="editTask('${task.id}')" title="点击编辑任务">
                            ${task.title} 
                            ${task.projectId ? `<span class="task-project">📋 ${getProjectName(task.projectId)}</span>` : ''}
                        </span>
                        ${description ? `<div class="task-description">${description}</div>` : ''}
                    </div>
                    <button onclick="deleteTask('${task.id}')" class="delete-btn">删除</button>
                </div>
            `;
        }).join('');
        undatedListContainer.innerHTML = undatedHtml;
    }
    
    // 8. 为可拖拽列表设置拖拽事件
    setTimeout(setupDragAndDrop, 0);
    
    // 9. 处理分组的折叠展开功能
    document.querySelectorAll('.group-header').forEach(header => {
        header.addEventListener('click', () => {
            const groupContent = header.nextElementSibling;
            if (groupContent) {
                groupContent.style.display = groupContent.style.display === 'none' ? 'block' : 'none';
                header.classList.toggle('collapsed');
            }
        });
    });
}

/**
 * 设置拖拽事件监听
 */
function setupDragAndDrop() {
    console.log('设置拖拽事件...');
    
    // 移除所有占位符元素
    document.querySelectorAll('.drop-placeholder').forEach(p => p.remove());
    
    // 重置拖拽状态变量
    draggedTaskId = null;
    
    // 解绑之前的事件监听器，避免重复绑定
    document.removeEventListener('dragstart', globalDragStartHandler);
    document.removeEventListener('dragover', globalDragOverHandler);
    document.removeEventListener('dragleave', globalDragLeaveHandler);
    document.removeEventListener('drop', globalDropHandler);
    document.removeEventListener('dragend', globalDragEndHandler);
    
    // 使用事件委托，将事件监听器附加到文档级别
    document.addEventListener('dragstart', globalDragStartHandler);
    document.addEventListener('dragover', globalDragOverHandler);
    document.addEventListener('dragleave', globalDragLeaveHandler);
    document.addEventListener('drop', globalDropHandler);
    document.addEventListener('dragend', globalDragEndHandler);
    
    // 直接为所有任务项绑定拖拽事件
    bindTaskItemEvents();
    
    console.log('拖拽事件监听器已设置');
}

/**
 * 绑定任务项的拖拽事件
 */
function bindTaskItemEvents() {
    console.log('正在绑定任务项拖拽事件...');
    
    // 重要：仅绑定无日期任务列表的拖拽功能
    const listsToBind = ['#undated-task-list'];

    listsToBind.forEach(listSelector => {
        const items = document.querySelectorAll(`${listSelector} .task-item`);
        console.log(`为${listSelector} 绑定拖拽事件, 找到 ${items.length} 个任务项`);
        
        items.forEach(item => {
            // 只对无日期任务设置为可拖拽
            item.draggable = true;
            
            // 移除旧的事件监听器，防止重复绑定
            item.removeEventListener('dragstart', handleDragStart);
            item.removeEventListener('dragover', handleDragOver);
            item.removeEventListener('dragleave', handleDragLeave);
            item.removeEventListener('drop', handleDrop);
            item.removeEventListener('dragend', handleDragEnd);
            
            // 添加新的事件监听器
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        });
    });
    
    // 同时设置容器的事件监听器
    // 注意：仅为无日期任务列表启用拖放功能
    listsToBind.forEach(listSelector => {
        const container = document.querySelector(listSelector);
        if (container) {
            // 移除旧的事件监听器
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('drop', handleDrop);
            
            // 添加新的事件监听器
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
        }
    });
    
    console.log('任务项拖拽事件绑定完成');
}

/**
 * 全局拖拽开始事件处理器
 */
function globalDragStartHandler(event) {
    // 如果点击的是任务项，触发拖拽开始
    if (event.target.closest('.task-item[draggable="true"]')) {
        console.log('全局拖拽开始被触发');
        handleDragStart(event);
    }
}

/**
 * 全局拖拽经过事件处理器
 */
function globalDragOverHandler(event) {
    // 只有在拖拽过程中才处理拖拽经过事件
    if (draggedTaskId) {
        const target = event.target.closest('.task-item[draggable="true"], #undated-task-list');
        if (target) {
            handleDragOver(event);
        }
    }
}

/**
 * 全局拖拽离开事件处理器
 */
function globalDragLeaveHandler(event) {
    // 只有在拖拽过程中才处理拖拽离开事件
    if (draggedTaskId) {
        const container = event.target.closest('#undated-task-list');
        if (container) {
            handleDragLeave(event);
        }
    }
}

/**
 * 全局放置事件处理器
 */
function globalDropHandler(event) {
    // 只有在拖拽过程中才处理放置事件
    if (draggedTaskId) {
        const target = event.target.closest('#undated-task-list, .task-item');
        if (target) {
            console.log('全局放置被触发');
            handleDrop(event);
        }
    }
}

/**
 * 全局拖拽结束事件处理器
 */
function globalDragEndHandler(event) {
    // 只有在拖拽过程中才处理拖拽结束事件
    if (draggedTaskId) {
        console.log('全局拖拽结束被触发');
        handleDragEnd(event);
    }
}

/**
 * 处理拖拽开始事件
 */
function handleDragStart(event) {
    const taskItem = event.target.closest('.task-item[draggable="true"]');
    if (taskItem) {
        // 保存拖拽元素信息
        draggedTaskId = taskItem.dataset.taskId;
        
        // 创建拖拽图像
        const dragImage = taskItem.cloneNode(true);
        dragImage.style.opacity = '0.5';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.style.width = taskItem.offsetWidth + 'px';
        document.body.appendChild(dragImage);
        
        // 设置自定义拖拽图像
        event.dataTransfer.setDragImage(dragImage, 10, 10);
        
        console.log('开始拖拽', {
            taskId: draggedTaskId,
            element: taskItem,
            sourceList: taskItem.closest('#undated-task-list')?.id
        });
        
        // 添加拖拽中的样式
        taskItem.classList.add('dragging');
        
        // 设置拖拽效果和数据 - 一定要设置
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', taskItem.dataset.taskId);
        
        // 清理拖拽图像元素
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 100);
    } else {
        console.warn('拖拽失败: 未找到任务项元素');
        event.preventDefault();
        return false;
    }
}

/**
 * 处理拖拽经过事件
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // 如果没有正在拖拽的任务，则退出
    if (!draggedTaskId) return;
    
    // 获取容器元素（无日期任务列表）
    const container = event.target.closest('#undated-task-list');
    if (!container) return; // 只在可拖拽的容器内响应

    // 设置拖拽效果
    event.dataTransfer.dropEffect = 'move';

    // 移除旧的占位符
    document.querySelectorAll('.drop-placeholder').forEach(p => p.remove());

    // 确定放置位置
    const targetItem = event.target.closest('.task-item');
    
    // 判断是否拖拽到了任务项上还是容器空白处
    if (targetItem && !targetItem.classList.contains('dragging')) {
        // 创建占位符
        const placeholder = document.createElement('div');
        placeholder.className = 'drop-placeholder';
        
        // 根据鼠标位置决定放在任务上方还是下方
        const rect = targetItem.getBoundingClientRect();
        const isTopHalf = event.clientY < rect.top + rect.height / 2;

        if (isTopHalf) {
            // 放在目标任务上方
            targetItem.parentNode.insertBefore(placeholder, targetItem);
        } else {
            // 放在目标任务下方
            targetItem.parentNode.insertBefore(placeholder, targetItem.nextSibling);
        }
        
        console.log('拖拽到任务上', {
            targetId: targetItem.dataset.taskId,
            position: isTopHalf ? '上方' : '下方'
        });
    } else if (!targetItem || targetItem.classList.contains('dragging')) {
        // 如果鼠标在容器空白处或拖拽到自己上面，则在列表末尾显示占位符
        const placeholder = document.createElement('div');
        placeholder.className = 'drop-placeholder';
        container.appendChild(placeholder);
        
        console.log('拖拽到列表末尾');
    }
}

/**
 * 处理拖拽离开事件
 */
function handleDragLeave(event) {
    // 当鼠标离开容器时，移除占位符
    const container = event.target.closest('#undated-task-list');
    if (container && !container.contains(event.relatedTarget)) {
        const placeholder = container.querySelector('.drop-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }
}

/**
 * 处理放置事件
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('handleDrop 被触发');

    // 检查占位符和拖拽任务ID
    const placeholder = document.querySelector('.drop-placeholder');
    if (!placeholder || !draggedTaskId) {
        console.warn('没有占位符或拖拽任务ID，取消放置');
        return;
    }

    // 获取容器
    const container = placeholder.closest('#undated-task-list');
    if (!container) {
        console.warn('找不到容器元素，取消放置');
        return;
    }

    console.log('放置到容器', container.id);

    // 获取被拖拽的任务
    const draggedTaskIndex = appData.tasks.findIndex(t => t.id === draggedTaskId);
    if (draggedTaskIndex === -1) {
        console.error("找不到被拖拽的任务 " + draggedTaskId);
        return;
    }
    
    // 从数组中取出被拖拽的任务
    const [draggedTask] = appData.tasks.splice(draggedTaskIndex, 1);
    
    // 确定放置位置并插入任务
    const nextElement = placeholder.nextElementSibling;
    placeholder.remove(); // 移除占位符
    
    if (nextElement && nextElement.dataset.taskId) {
        // 放在下一个元素之前
        const targetId = nextElement.dataset.taskId;
        const targetIndex = appData.tasks.findIndex(t => t.id === targetId);
        if (targetIndex !== -1) {
            console.log(`将任务${draggedTask.id} 插入到任务${targetId} 之前`);
            appData.tasks.splice(targetIndex, 0, draggedTask);
        } else {
            console.log('目标任务不存在，放置到列表末尾');
            appData.tasks.push(draggedTask);
        }
    } else {
        // 放在列表末尾
        console.log('放置到列表末尾');
        appData.tasks.push(draggedTask);
    }

    // 保存数据并重新渲染
    saveData();
    renderTasks();
    
    // 确保拖拽事件正确设置
    setTimeout(setupDragAndDrop, 0);
}

/**
 * 处理拖拽结束事件
 */
function handleDragEnd(event) {
    // 清理拖拽源元素
    const draggedItem = document.querySelector('.dragging');
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
    }
    
    // 重置拖拽状态变量
    draggedTaskId = null;
    
    // 清理所有占位符
    document.querySelectorAll('.drop-placeholder').forEach(p => p.remove());
    
    console.log('拖拽结束，所有样式已清理');
}

/**
 * 切换任务完成状态
 */
function toggleTask(taskId) {
    const taskIndex = appData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = appData.tasks[taskIndex];
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        
        // 保存数据并重新渲染
        saveData();
        renderTasks();
    }
}

/**
 * 删除任务
 */
function deleteTask(taskId) {
    if (confirm('确定要删除这个任务吗？')) {
        const taskIndex = appData.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            appData.tasks.splice(taskIndex, 1);
            
            // 保存数据并重新渲染
            saveData();
            renderTasks();
        }
    }
}

/**
 * 编辑任务
 */
function editTask(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (task) {
        // 填充编辑表单
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskDueDate').value = task.dueDate ? formatDateForInput(task.dueDate) : '';
        document.getElementById('editTaskStatus').value = task.status;
        document.getElementById('editTaskProject').value = task.projectId || '';
        
        // 保存当前编辑的任务ID
        currentEditingTaskId = taskId;
        
        // 显示编辑模态框
        document.getElementById('editTaskModal').style.display = 'block';
    }
}

/**
 * 格式化日期，适用于input[type="date"]
 */
function formatDateForInput(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

// 导出函数
window.renderTasks = renderTasks;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.editTask = editTask; 
