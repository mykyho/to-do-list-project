class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [
            { name: 'Personal', color: '#FFC0CB' },
            { name: 'Work', color: '#90cdf4' },
            { name: 'School', color: '#9ae6b4' }
        ];
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.quickChecklist = JSON.parse(localStorage.getItem('quickChecklist')) || [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.renderCalendar();
        this.renderTasks();
        this.updateTaskCounts();
        this.renderCategories();
        this.renderQuickChecklist();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.categorySelect = document.getElementById('categorySelect');
        this.dueDateInput = document.getElementById('dueDate');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.currentMonthElement = document.getElementById('currentMonth');
        this.calendarDays = document.getElementById('calendarDays');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.categoryList = document.getElementById('categoryList');
        this.newCategoryName = document.getElementById('newCategoryName');
        this.newCategoryColor = document.getElementById('newCategoryColor');
        this.addCategoryBtn = document.getElementById('addCategoryBtn');
        this.editTaskCategory = document.getElementById('editTaskCategory');
        this.quickChecklistInput = document.getElementById('quickChecklistInput');
        this.addQuickChecklistBtn = document.getElementById('addQuickChecklistBtn');
        this.quickChecklistList = document.getElementById('quickChecklist');
        
        // Set default due date to today
        const today = new Date().toISOString().split('T')[0];
        this.dueDateInput.value = today;
    }

    setupEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        
        // Drag and drop event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDragAndDrop();
        });

        // Category dropdown logic (dynamic popover)
        const toggleBtn = document.getElementById('toggleCategoryDropdown');
        if (toggleBtn) {
            let popover = null;
            const showPopover = () => {
                if (popover) return;
                popover = document.createElement('div');
                popover.id = 'categoryDropdown';
                popover.className = 'category-dropdown open';
                popover.innerHTML = `
                    <h4><i class="fas fa-tags"></i> Manage Categories</h4>
                    <div id="categoryList"></div>
                    <div class="form-group add-category-form">
                        <h5>Add New Category</h5>
                        <input type="text" id="newCategoryName" placeholder="Category Name">
                        <div class="color-picker-wrapper">
                            <label for="newCategoryColor">Category Color</label>
                            <input type="color" id="newCategoryColor" value="#FFC0CB">
                        </div>
                        <button id="addCategoryBtn" class="btn-primary">Add Category</button>
                    </div>
                `;
                document.body.appendChild(popover);
                // Position popover below the icon
                const rect = toggleBtn.getBoundingClientRect();
                popover.style.position = 'absolute';
                popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
                popover.style.left = `${rect.left + window.scrollX - popover.offsetWidth + toggleBtn.offsetWidth}px`;
                popover.style.display = 'block';
                // Render categories in popover
                this.categoryList = popover.querySelector('#categoryList');
                this.newCategoryName = popover.querySelector('#newCategoryName');
                this.newCategoryColor = popover.querySelector('#newCategoryColor');
                this.addCategoryBtn = popover.querySelector('#addCategoryBtn');
                this.renderCategories();
                // Add event for addCategoryBtn
                if (this.addCategoryBtn) {
                    this.addCategoryBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const name = this.newCategoryName.value.trim();
                        const color = this.newCategoryColor.value;
                        if (!name) {
                            this.showNotification('Please enter a category name', 'error');
                            return;
                        }
                        if (this.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
                            this.showNotification('Category already exists', 'error');
                            return;
                        }
                        this.categories.push({ name, color });
                        this.saveCategories();
                        this.renderCategories();
                        this.newCategoryName.value = '';
                        this.newCategoryColor.value = '#FFC0CB';
                        this.showNotification('Category added!', 'success');
                    });
                }
                // Prevent closing when clicking inside
                popover.addEventListener('click', (e) => e.stopPropagation());
                // Close on outside click
                setTimeout(() => {
                    document.addEventListener('click', hidePopover, { once: true });
                }, 0);
            };
            const hidePopover = () => {
                if (popover) {
                    document.body.removeChild(popover);
                    popover = null;
                }
            };
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (popover) {
                    hidePopover();
                } else {
                    showPopover();
                }
            });
        }

        if (this.addQuickChecklistBtn && this.quickChecklistInput) {
            this.addQuickChecklistBtn.addEventListener('click', () => this.addQuickChecklistItem());
            this.quickChecklistInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addQuickChecklistItem();
            });
        }
    }

    addTask() {
        const title = this.taskInput.value.trim();
        const category = this.categorySelect.value;
        const dueDate = this.dueDateInput.value;
        
        if (!title) {
            this.showNotification('Please enter a task title', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            category,
            dueDate,
            status: 'not-started',
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        this.renderCalendar();
        
        // Clear input
        this.taskInput.value = '';
        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
        this.renderCalendar();
        this.showNotification('Task deleted successfully!', 'success');
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newTitle = prompt('Edit task title:', task.title);
        if (newTitle !== null && newTitle.trim() !== '') {
            task.title = newTitle.trim();
            this.saveTasks();
            this.renderTasks();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    changeTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
            this.renderCalendar();
        }
    }

    renderTasks() {
        const taskLists = {
            'not-started': document.querySelector('[data-status="not-started"]'),
            'in-progress': document.querySelector('[data-status="in-progress"]'),
            'completed': document.querySelector('[data-status="completed"]')
        };

        // Clear all task lists
        Object.values(taskLists).forEach(list => {
            list.innerHTML = '';
        });

        // Render tasks in their respective columns
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskLists[task.status].appendChild(taskElement);
        });

        // Setup drag and drop after rendering tasks
        this.setupDragAndDrop();
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.draggable = true;
        taskDiv.dataset.taskId = task.id;

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed';

        // Find the category object for this task
        const catObj = this.categories.find(cat => cat.name === task.category);
        let categoryStyle = '';
        if (catObj) {
            categoryStyle = `background: ${catObj.color} !important; color: #fff !important; border: 1.5px solid #EADDCA;`;
        }

        taskDiv.innerHTML = `
            <div class="task-header">
                <div class="task-title ${isOverdue ? 'overdue' : ''}">${task.title}</div>
                <div class="task-actions">
                    <button class="task-btn edit" onclick="todoApp.editTask(${task.id})" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete" onclick="todoApp.deleteTask(${task.id})" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-details">
                <span class="task-category" style="${categoryStyle}">${task.category}</span>
                ${task.dueDate ? `
                    <div class="task-due-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(task.dueDate)}
                        ${isOverdue ? '<span style=\"color: #e53e3e;\">(Overdue)</span>' : ''}
                    </div>
                ` : ''}
            </div>
        `;
        // Force set background and color directly for robustness
        const catSpan = taskDiv.querySelector('.task-category');
        if (catObj && catSpan) {
            catSpan.style.backgroundColor = catObj.color;
            catSpan.style.color = '#fff';
        }

        return taskDiv;
    }

    setupDragAndDrop() {
        // Remove existing event listeners first
        const taskLists = document.querySelectorAll('.task-list');
        const tasks = document.querySelectorAll('.task');

        // Clear existing event listeners
        taskLists.forEach(list => {
            list.removeEventListener('dragover', this.handleDragOver.bind(this));
            list.removeEventListener('drop', this.handleDrop.bind(this));
            list.removeEventListener('dragenter', this.handleDragEnter.bind(this));
            list.removeEventListener('dragleave', this.handleDragLeave.bind(this));
        });

        tasks.forEach(task => {
            task.removeEventListener('dragstart', this.handleDragStart.bind(this));
            task.removeEventListener('dragend', this.handleDragEnd.bind(this));
        });

        // Add new event listeners
        tasks.forEach(task => {
            task.addEventListener('dragstart', (e) => this.handleDragStart(e));
            task.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => this.handleDragOver(e));
            list.addEventListener('drop', (e) => this.handleDrop(e));
            list.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            list.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
        e.dataTransfer.effectAllowed = 'move';
        
        // Add visual feedback
        e.target.style.opacity = '0.5';
        e.target.style.transform = 'rotate(5deg)';
        
        // Show drop zones
        document.querySelectorAll('.task-list').forEach(list => {
            list.classList.add('drop-zone-active');
        });
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        e.target.style.opacity = '';
        e.target.style.transform = '';
        
        // Remove drop zone indicators
        document.querySelectorAll('.task-list').forEach(list => {
            list.classList.remove('drop-zone-active');
            list.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        const taskList = e.target.closest('.task-list');
        if (taskList) {
            taskList.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const taskList = e.target.closest('.task-list');
        if (taskList && !taskList.contains(e.relatedTarget)) {
            taskList.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const taskList = e.target.closest('.task-list');
        if (!taskList) return;
        
        taskList.classList.remove('drag-over');
        taskList.classList.remove('drop-zone-active');
        
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const newStatus = taskList.dataset.status;
        
        // Get the old status for comparison
        const task = this.tasks.find(t => t.id === taskId);
        const oldStatus = task ? task.status : null;
        
        if (oldStatus !== newStatus) {
            this.changeTaskStatus(taskId, newStatus);
            
            // Show success notification with status change
            const statusNames = {
                'not-started': 'Not Yet Started',
                'in-progress': 'In Progress',
                'completed': 'Completed'
            };
            
            this.showNotification(
                `Task moved to ${statusNames[newStatus]}!`, 
                'success'
            );
        }
    }

    renderCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        this.currentMonthElement.textContent = firstDay.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        this.calendarDays.innerHTML = '';

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();

            // Check if it's today
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            // Check if it's from another month
            if (date.getMonth() !== this.currentMonth) {
                dayElement.classList.add('other-month');
            }

            // Check if there are tasks on this date
            const tasksOnDate = this.tasks.filter(task => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === date.toDateString();
            });

            if (tasksOnDate.length > 0) {
                dayElement.classList.add('has-tasks');
                dayElement.title = `${tasksOnDate.length} task(s) on this date`;
            }

            this.calendarDays.appendChild(dayElement);
        }
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        
        this.renderCalendar();
    }

    updateTaskCounts() {
        const counts = {
            'not-started': 0,
            'in-progress': 0,
            'completed': 0
        };

        this.tasks.forEach(task => {
            counts[task.status]++;
        });

        document.querySelector('#notStarted .task-count').textContent = counts['not-started'];
        document.querySelector('#inProgress .task-count').textContent = counts['in-progress'];
        document.querySelector('#completed .task-count').textContent = counts['completed'];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            success: '#38a169',
            error: '#e53e3e',
            info: '#667eea'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    renderCategories() {
        // Render select options
        if (this.categorySelect) {
            this.categorySelect.innerHTML = '';
            this.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name;
                option.style.backgroundColor = '';
                this.categorySelect.appendChild(option);
            });
        }
        // Render edit modal select
        if (this.editTaskCategory) {
            this.editTaskCategory.innerHTML = '';
            this.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name;
                option.style.backgroundColor = '';
                this.editTaskCategory.appendChild(option);
            });
        }
        // Render category list in dropdown
        if (this.categoryList) {
            this.categoryList.innerHTML = '';
            this.categories.forEach((cat, idx) => {
                const div = document.createElement('div');
                div.className = 'category-item';
                // Make the dot itself a color input (no popover logic)
                div.innerHTML = `
                    <input type="color" class="category-color-preview" value="${cat.color}" title="Change color"
                        style="appearance: none; -webkit-appearance: none; border: none; width: 24px; height: 24px; border-radius: 50%; box-shadow: 0 2px 8px rgba(217,170,183,0.18); background: ${cat.color}; cursor: pointer; display: inline-block; vertical-align: middle; padding: 0; margin-right: 16px; outline: none; transition: box-shadow 0.2s, border 0.2s;" />
                    <span class="category-name">${cat.name}</span>
                    <div class="category-actions">
                        <button class="delete-category-btn" title="Delete" data-idx="${idx}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                // Color input event
                const colorInput = div.querySelector('.category-color-preview');
                colorInput.addEventListener('input', (e) => {
                    this.categories[idx].color = e.target.value;
                    this.saveCategories();
                    this.renderTasks();
                });
                div.querySelector('.delete-category-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.categories.splice(idx, 1);
                    this.saveCategories();
                    this.renderCategories();
                    this.showNotification('Category deleted', 'success');
                });
                this.categoryList.appendChild(div);
            });
        }
    }

    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    addQuickChecklistItem() {
        const text = this.quickChecklistInput.value.trim();
        if (!text) return;
        this.quickChecklist.push({ text, checked: false });
        this.saveQuickChecklist();
        this.renderQuickChecklist();
        this.quickChecklistInput.value = '';
    }

    toggleQuickChecklistItem(idx) {
        this.quickChecklist[idx].checked = !this.quickChecklist[idx].checked;
        this.saveQuickChecklist();
        this.renderQuickChecklist();
    }

    deleteQuickChecklistItem(idx) {
        this.quickChecklist.splice(idx, 1);
        this.saveQuickChecklist();
        this.renderQuickChecklist();
    }

    renderQuickChecklist() {
        if (!this.quickChecklistList) return;
        this.quickChecklistList.innerHTML = '';
        this.quickChecklist.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'quick-checklist-item';
            li.innerHTML = `
                <input type="checkbox" class="quick-checklist-checkbox" ${item.checked ? 'checked' : ''}>
                <span class="quick-checklist-label" style="text-decoration:${item.checked ? 'line-through' : 'none'};opacity:${item.checked ? 0.5 : 1}">${item.text}</span>
                <button class="quick-checklist-delete" title="Delete"><i class="fas fa-trash"></i></button>
            `;
            li.querySelector('.quick-checklist-checkbox').addEventListener('change', () => this.toggleQuickChecklistItem(idx));
            li.querySelector('.quick-checklist-delete').addEventListener('click', () => this.deleteQuickChecklistItem(idx));
            this.quickChecklistList.appendChild(li);
        });
    }

    saveQuickChecklist() {
        localStorage.setItem('quickChecklist', JSON.stringify(this.quickChecklist));
    }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Add some sample tasks for demonstration
window.addEventListener('load', () => {
    if (todoApp.tasks.length === 0) {
        const sampleTasks = [
            {
                id: Date.now() - 3,
                title: 'Complete project presentation',
                category: 'work',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'in-progress',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() - 2,
                title: 'Study for math exam',
                category: 'school',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'not-started',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() - 1,
                title: 'Buy groceries',
                category: 'personal',
                dueDate: new Date().toISOString().split('T')[0],
                status: 'completed',
                createdAt: new Date().toISOString()
            }
        ];
        
        todoApp.tasks = sampleTasks;
        todoApp.saveTasks();
        todoApp.renderTasks();
        todoApp.updateTaskCounts();
        todoApp.renderCalendar();
    }
}); 