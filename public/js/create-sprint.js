import { showNotification } from '../js/util/notification.js';
import { showCreateSprintLoading } from '../js/util/loading-screen.js';

const loginPage = '/account/login';
const BACKEND_URL = window.appConfig.BACKEND_URL;
const SIMPLE_ONE_URL = window.appConfig.SIMPLE_ONE_URL;

export async function sendSprintToCreate() {
    let sprintDto = createSprintDto();
    let token = localStorage.getItem('accessToken');

    try {
        let response = await fetch(BACKEND_URL + '/api/v1/sprints', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sprintDto),
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (response.ok) {
            showNotification('Спринт успешно создан', 'success');
        } else {
            showNotification('Ошибка при создании спринта', 'error');
        }
    } catch (error) {
        console.error('Ошибка при создании спринта:', error);
        showNotification('Ошибка при создании спринта', 'error');
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
        let url = new URL(BACKEND_URL + '/api/v1/tasks/excluded/sprints/' + currentSprintId);
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

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
            taskElement.className = 'flex items-center mb-2';
            taskElement.innerHTML = `
                <input id='include-tasks' type='checkbox' class='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded' data-id='${task.id}'>
                <label for='include-tasks' class='ml-2 block text-xs text-gray-700'>
                    <a href='${url}' target='_blank' class='text-indigo-600 hover:text-indigo-800 underline'>
                        ${task.number}
                    </a>: ${task.subject}
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

    // установка значений по умолчанию, если они не заполнены
    if (!sprintStartDate.value) {
        let today = new Date();
        let formattedToday = formatDate(today);
        sprintStartDate.value = formattedToday; // текущая дата
    }

    if (!sprintEndDate.value) {
        let endDate = new Date();
        endDate.setDate(endDate.getDate() + 14); // добавляем 14 дней
        let formattedEndDate = formatDate(endDate);
        sprintEndDate.value = formattedEndDate;
    }

    // проверка названия спринта
    let sprintName = sprintNameInput.value.trim();
    if (!sprintName) {
        sprintName = 'Спринт'; // название по умолчанию
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
