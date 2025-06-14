/**
 * Markdown渲染工具
 * 将简单的Markdown语法渲染为HTML
 */

/**
 * 渲染Markdown文本为HTML
 * @param {string} text - Markdown格式的文本
 * @returns {string} - 渲染后的HTML
 */
function renderMarkdown(text) {
    if (!text) return '';
    
    // 转义HTML特殊字符，防止XSS攻击
    text = escapeHtml(text);
    
    // 处理链接 [文本](链接)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // 处理粗体 **文本**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体 *文本*
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // 处理代码块 ```代码```
    text = text.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
    
    // 处理行内代码 `代码`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 处理列表项 - 项目
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    
    // 将连续的列表项包装在ul标签中
    text = text.replace(/(<li>.+<\/li>)+/g, '<ul>$&</ul>');
    
    // 处理标题 # 标题
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // 处理段落，将换行符转换为<br>标签
    text = text.replace(/\n/g, '<br>');
    
    // 处理任务引用 @任务ID - 添加特殊样式
    text = text.replace(/@([a-zA-Z0-9]+)/g, '<span class="task-reference" onclick="jumpToTask(\'$1\')">@$1</span>');
    
    return text;
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param {string} text - 原始文本
 * @returns {string} - 转义后的文本
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * 跳转到指定ID的任务
 * @param {string} taskId - 任务ID
 */
function jumpToTask(taskId) {
    // 查找任务
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) {
        alert('找不到指定的任务');
        return;
    }
    
    // 切换到任务列表视图
    switchView('tasks');
    
    // 高亮显示任务
    setTimeout(() => {
        const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
        if (taskElement) {
            // 滚动到任务位置
            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // 添加高亮效果
            taskElement.classList.add('highlighted');
            
            // 3秒后移除高亮效果
            setTimeout(() => {
                taskElement.classList.remove('highlighted');
            }, 3000);
        }
    }, 100);
}

// 导出函数
window.renderMarkdown = renderMarkdown;
window.jumpToTask = jumpToTask; 