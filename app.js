document.addEventListener('DOMContentLoaded', function () {
    const sideMenu = document.querySelector('.SideMenu');
    const backButton = document.querySelector('.back');
    const createButton = document.querySelector('.creat-button button');
    const tasksContainer = document.querySelector('.tasks');
    const searchInput = document.querySelector('.serch-section input');
    const sideMenuLinks = document.querySelectorAll('.sidemenu-link a');
    const usernameElement = document.querySelector('.username h1');
    const helloUserElement = document.querySelector('.content p');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let username = localStorage.getItem('username') || 'USER';

    function updateUsername() {
        usernameElement.textContent = username;
        helloUserElement.textContent = `Hello, ${username}`;
    }

    updateUsername();

    function loadTasks() {
        tasksContainer.innerHTML = '';
        tasks.forEach(task => {
            const newTask = createTaskElement(task.title, task.description, task.status);
            tasksContainer.appendChild(newTask);
        });
    }

    loadTasks();

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    backButton.addEventListener('click', function () {
        sideMenu.classList.toggle('collapsed');
    });

    usernameElement.addEventListener('click', function () {
        showChangeUsernameModal();
    });

    createButton.addEventListener('click', function (e) {
        e.preventDefault();
        showCreateTaskModal();
    });

    searchInput.addEventListener('input', function () {
        filterTasks(this.value);
    });

    sideMenuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const status = this.getAttribute('data-status');
            filterTasksByStatus(status);
        });
    });

    function showChangeUsernameModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Change Username</h2>
                <input type="text" id="newUsername" placeholder="New username" value="${username}">
                <div class="modal-buttons">
                    <button id="saveUsername">Save</button>
                    <button id="closeModal">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('saveUsername').addEventListener('click', saveNewUsername);
        document.getElementById('closeModal').addEventListener('click', () => modal.remove());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    function saveNewUsername() {
        const newUsername = document.getElementById('newUsername').value.trim();
        if (newUsername) {
            username = newUsername;
            localStorage.setItem('username', username);
            updateUsername();
            document.querySelector('.modal').remove();
        }
    }

    function showCreateTaskModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Create New Task</h2>
                <input type="text" id="taskTitle" placeholder="Task title">
                <textarea id="taskDescription" placeholder="Task description"></textarea>
                <div class="modal-buttons">
                    <button id="saveTask">Save Task</button>
                    <button id="closeModal">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('saveTask').addEventListener('click', saveNewTask);
        document.getElementById('closeModal').addEventListener('click', () => modal.remove());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    function saveNewTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        if (title && description) {
            const newTask = {
                title: title,
                description: description,
                status: 'in-progress'
            };
            tasks.unshift(newTask);
            saveTasks();
            const newTaskElement = createTaskElement(title, description, 'in-progress');
            tasksContainer.prepend(newTaskElement);
            document.querySelector('.modal').remove();
        }
    }

    function createTaskElement(title, description, status) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <div class="task-content">
                <h3>${title}</h3>
                <hr>
                <p>${description}</p>
                <p class="task-status ${status}">${getStatusText(status)}</p>
            </div>
            <div class="task-buttons">
                <button class="square"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="check"><i class="fa-solid fa-check"></i></button>
                <button class="trash"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        addTaskButtonListeners(taskCard);
        return taskCard;
    }

    function getStatusText(status) {
        switch (status) {
            case 'in-progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'on-hold':
                return 'On Hold';
            default:
                return 'In Progress';
        }
    }

    function addTaskButtonListeners(taskCard) {
        const editButton = taskCard.querySelector('.square');
        const completeButton = taskCard.querySelector('.check');
        const deleteButton = taskCard.querySelector('.trash');

        editButton.addEventListener('click', () => editTask(taskCard));
        completeButton.addEventListener('click', () => toggleTaskCompletion(taskCard));
        deleteButton.addEventListener('click', () => deleteTask(taskCard));
    }

    function editTask(taskCard) {
        const title = taskCard.querySelector('h3').textContent;
        const description = taskCard.querySelector('p').textContent;
        const status = taskCard.querySelector('.task-status').className.split(' ')[1];

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Edit Task</h2>
                <input type="text" id="editTaskTitle" value="${title}">
                <textarea id="editTaskDescription">${description}</textarea>
                <div class="modal-buttons">
                    <button id="saveEditTask">Save</button>
                    <button id="closeModal">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('saveEditTask').addEventListener('click', () => saveEditedTask(taskCard, status));
        document.getElementById('closeModal').addEventListener('click', () => modal.remove());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    function saveEditedTask(taskCard, status) {
        const newTitle = document.getElementById('editTaskTitle').value;
        const newDescription = document.getElementById('editTaskDescription').value;
        if (newTitle && newDescription) {
            taskCard.querySelector('h3').textContent = newTitle;
            taskCard.querySelector('p').textContent = newDescription;
            updateTaskInArray(taskCard, newTitle, newDescription, status);
            document.querySelector('.modal').remove();
        }
    }

    function updateTaskInArray(taskCard, newTitle, newDescription, status) {
        const oldTitle = taskCard.querySelector('h3').textContent;
        const taskIndex = tasks.findIndex(task => task.title === oldTitle);
        if (taskIndex !== -1) {
            tasks[taskIndex].title = newTitle;
            tasks[taskIndex].description = newDescription;
            tasks[taskIndex].status = status;
            saveTasks();
        }
    }

    function toggleTaskCompletion(taskCard) {
        const statusElement = taskCard.querySelector('.task-status');
        const currentStatus = statusElement.className.split(' ')[1];
        let newStatus;

        if (currentStatus === 'completed') {
            newStatus = 'in-progress';
            statusElement.textContent = 'In Progress';
            statusElement.className = 'task-status in-progress';
        } else {
            newStatus = 'completed';
            statusElement.textContent = 'Completed';
            statusElement.className = 'task-status completed';
        }

        updateTaskStatus(taskCard, newStatus);
    }

    function updateTaskStatus(taskCard, newStatus) {
        const taskTitle = taskCard.querySelector('h3').textContent;
        const taskIndex = tasks.findIndex(task => task.title === taskTitle);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            saveTasks();
        }
    }

    function deleteTask(taskCard) {
        const taskTitle = taskCard.querySelector('h3').textContent;
        tasks = tasks.filter(task => task.title !== taskTitle);
        saveTasks();
        taskCard.remove();
    }

    function filterTasks(searchTerm) {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(taskCard => {
            const title = taskCard.querySelector('h3').textContent.toLowerCase();
            const description = taskCard.querySelector('p').textContent.toLowerCase();
            if (title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())) {
                taskCard.style.display = '';
            } else {
                taskCard.style.display = 'none';
            }
        });
    }

    function filterTasksByStatus(status) {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(taskCard => {
            const taskStatus = taskCard.querySelector('.task-status').className.split(' ')[1];
            if (status === 'all' || taskStatus === status) {
                taskCard.style.display = '';
            } else {
                taskCard.style.display = 'none';
            }
        });
    }

    document.querySelectorAll('.task-card').forEach(addTaskButtonListeners);
});
