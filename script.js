document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');
    const searchTaskInput = document.getElementById('search-task');
    const dueDateInput = document.getElementById('task-due-date');
    const prioritySelect = document.getElementById('task-priority');
    const categorySelect = document.getElementById('task-category');
    const themeToggle = document.getElementById('theme-toggle');
    const sortTasksSelect = document.getElementById('sort-tasks');
    const modal = document.getElementById('motivational-quote-modal');
    const motivationalQuote = document.getElementById('motivational-quote');
    const closeModalButton = document.getElementById('close-modal');

    const quotes = [
        "Stay focused and never give up!",
        "You can do it!",
        "Believe in yourself!",
        "Every step is progress!",
        "Keep pushing forward!"
    ];

    addTaskButton.addEventListener('click', addTask);
    searchTaskInput.addEventListener('input', filterTasks);
    themeToggle.addEventListener('click', toggleTheme);
    sortTasksSelect.addEventListener('change', sortTasks);
    closeModalButton.addEventListener('click', () => modal.style.display = 'none');

    loadTasksFromStorage();
    showMotivationalQuote();
    updateProgress();

    function addTask() {
        const taskName = newTaskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = prioritySelect.value;
        const category = categorySelect.value;

        if (taskName === '') return;

        const taskItem = createTaskItem(taskName, dueDate, priority, category);
        taskList.appendChild(taskItem);
        newTaskInput.value = '';
        dueDateInput.value = '';
        saveTasksToStorage();
        updateProgress();
    }

    function createTaskItem(taskName, dueDate, priority, category) {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item', `${priority.toLowerCase()}-priority`);
        taskItem.innerHTML = `
            <div class="task-details">
                <span class="task-name">${taskName}</span>
                <span class="task-due-date">${dueDate}</span>
                <span class="task-priority">Priority: ${priority}</span>
                <span class="task-category">Category: ${category}</span>
            </div>
            <div class="task-actions">
                <button class="complete-btn">✔️</button>
                <button class="delete-btn">❌</button>
            </div>
        `;
        if (isOverdue(dueDate)) {
            taskItem.classList.add('overdue');
        } else if (isDueToday(dueDate)) {
            taskItem.classList.add('due-today');
        } else if (isDueSoon(dueDate)) {
            taskItem.classList.add('due-soon');
        }

        taskItem.querySelector('.complete-btn').addEventListener('click', () => {
            taskItem.classList.toggle('completed');
            saveTasksToStorage();
            updateProgress();
        });

        taskItem.querySelector('.delete-btn').addEventListener('click', () => {
            taskItem.remove();
            saveTasksToStorage();
            updateProgress();
        });

        return taskItem;
    }

    function filterTasks() {
        const searchText = searchTaskInput.value.toLowerCase();
        const tasks = taskList.querySelectorAll('.task-item');
        tasks.forEach(task => {
            const taskName = task.querySelector('.task-name').textContent.toLowerCase();
            if (taskName.includes(searchText)) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
    }

    function sortTasks() {
        const sortBy = sortTasksSelect.value;
        const tasks = Array.from(taskList.querySelectorAll('.task-item'));

        tasks.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                return priorityOrder[a.querySelector('.task-priority').textContent.replace('Priority: ', '')]
                    - priorityOrder[b.querySelector('.task-priority').textContent.replace('Priority: ', '')];
            } else if (sortBy === 'due-date') {
                return new Date(a.querySelector('.task-due-date').textContent) - new Date(b.querySelector('.task-due-date').textContent);
            } else if (sortBy === 'category') {
                return a.querySelector('.task-category').textContent.localeCompare(b.querySelector('.task-category').textContent);
            }
        });

        tasks.forEach(task => taskList.appendChild(task));
    }

    function saveTasksToStorage() {
        const tasks = Array.from(taskList.querySelectorAll('.task-item')).map(task => ({
            name: task.querySelector('.task-name').textContent,
            dueDate: task.querySelector('.task-due-date').textContent,
            priority: task.querySelector('.task-priority').textContent.replace('Priority: ', ''),
            category: task.querySelector('.task-category').textContent.replace('Category: ', ''),
            completed: task.classList.contains('completed')
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(taskData => {
            const taskItem = createTaskItem(taskData.name, taskData.dueDate, taskData.priority, taskData.category);
            if (taskData.completed) taskItem.classList.add('completed');
            taskList.appendChild(taskItem);
        });
    }

    function updateProgress() {
        const tasks = taskList.querySelectorAll('.task-item');
        const completedTasks = taskList.querySelectorAll('.task-item.completed');
        const progress = tasks.length === 0 ? 0 : (completedTasks.length / tasks.length) * 100;
        document.querySelector('.progress').style.width = `${progress}%`;
        document.getElementById('task-stats').textContent = `${completedTasks.length} of ${tasks.length} tasks completed`;
    }

    function isOverdue(dueDate) {
        return new Date(dueDate) < new Date();
    }

    function isDueToday(dueDate) {
        const today = new Date();
        const dueDateObj = new Date(dueDate);
        return today.toDateString() === dueDateObj.toDateString();
    }

    function isDueSoon(dueDate) {
        const today = new Date();
        const dueDateObj = new Date(dueDate);
        const timeDifference = dueDateObj - today;
        return timeDifference > 0 && timeDifference <= 3 * 24 * 60 * 60 * 1000;
    }

    function showMotivationalQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        motivationalQuote.textContent = quotes[randomIndex];
        modal.style.display = 'block';
    }
});
