import { showNotification } from '../js/util/notification.js';
import { showCreateSprintLoading } from '../js/util/loading-screen.js';
import { refreshToken } from '../js/util/util.js';

let baseUrl = window.location.origin;
const SIMPLE_ONE_URL = window.appConfig.SIMPLE_ONE_URL;

export async function sendSprintToCreate() {
    let sprintDto = createSprintDto();
    let token = localStorage.getItem('accessToken');
    document.getElementById("skeleton-loader").classList.remove("hidden");
    document.getElementById("create-sprint-content").classList.add("hidden");
    
    try {
        let response = await fetch(`${baseUrl}/api/v1/sprints`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sprintDto),
        });

        refreshToken(response);

        if (response.ok) {
            showNotification('Спринт успешно создан', 'success');
            document.getElementById("skeleton-loader").classList.add("hidden");
            document.getElementById("create-sprint-content").classList.remove("hidden");
        } else {
            showNotification('Ошибка при создании спринта', 'error');
        }
    } catch (error) {
        console.error('Ошибка при создании спринта:', error);
        showNotification('Ошибка при создании спринта', 'error');
        document.getElementById("skeleton-loader").classList.add("hidden");
        document.getElementById("create-sprint-content").classList.remove("hidden");
    }

    // инициализация: отрисовываем задачи
    renderTasks();
}

// функция для отрисовки задач
export async function renderTasks() {
    let token = localStorage.getItem('accessToken');
    let currentSprintId = localStorage.getItem('currentSprintId');
    showCreateSprintLoading();

    try {
        let url = new URL(`${baseUrl}/api/v1/tasks/excluded/sprints/${currentSprintId}`);
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        refreshToken(response);

        if (!response.ok) {
            showNotification('Ошибка при получении задач', 'error');
        }

        let tasks = await response.json();
        let taskContainer = document.getElementById('include-tasks');
        let taskContainerText = document.getElementById('include-tasks-to-current-sprint');

        // очищаем контейнер перед добавлением новых задач
        taskContainer.innerHTML = '';

        // создаем элементы для каждой задачи
        tasks.forEach((task) => {
            let url = SIMPLE_ONE_URL + task.externalId;
            let taskElement = document.createElement('div');
            taskElement.className = 'flex items-center mb-4';
            taskElement.innerHTML = `
                <input id='include-tasks' type='checkbox' class='task-checkbox' data-id='${task.id}'>
                <label for='include-tasks' class='task-list-placeholder'>
                    <a href='${url}' target='_blank' class='task-link'>
                        ${task.number}
                    </a>${task.subject}
                </label>
            `;
            taskContainer.appendChild(taskElement);
        });

        if (!Array.isArray(tasks) || tasks.length === 0) {
            taskContainerText.textContent = 'Все задачи из бэклога в работе';
        }

    } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
    }
}

// функция для сбора выбранных задач в DTO
function createSprintDto() {
    let taskContainer = document.getElementById('include-tasks');
    let sprintNameInput = document.getElementById('sprint-name');
    let sprintStartDate = document.getElementById('start-date');
    let sprintEndDate = document.getElementById('end-date');
    let selectedTasks = [];
    let today = new Date();
    let formattedToday = formatDate(today);
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // добавляем 14 дней
    let formattedEndDate = formatDate(endDate);

    // установка значений по умолчанию, если они не заполнены
    if (!sprintStartDate.value) {
        sprintStartDate.value = formattedToday; // текущая дата
    }

    if (!sprintEndDate.value) {
        sprintEndDate.value = formattedEndDate;
    }

    // проверка названия спринта
    let sprintName = sprintNameInput.value.trim();
    if (!sprintName) {
        sprintName = 'Спринт ' + formattedToday + ' ' + formattedEndDate; // название по умолчанию
        sprintNameInput.value = sprintName; // обновляем значение поля
    }

    // сбор выбранных задач
    let checkboxes = taskContainer.querySelectorAll("input[type='checkbox']:checked");
    checkboxes.forEach((checkbox) => {
        let taskId = checkbox.dataset.id; // получаем ID задачи из атрибута data-id

        if (taskId) {
            selectedTasks.push(taskId);
        }
    });

    let sprintDto = {
        sprintName: sprintName,
        startDate: sprintStartDate.value,
        endDate: sprintEndDate.value,
        taskIds: selectedTasks
    };

    return sprintDto;
}

// вспомогательная функция для форматирования даты в формат YYYY-MM-DD
function formatDate(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // месяцы начинаются с 0
    let day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
