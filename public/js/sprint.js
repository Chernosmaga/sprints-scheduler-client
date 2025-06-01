import { showNotification } from '../js/util/notification.js';
import { getProgressPercentage, parseDate, createButton } from '../js/util/util.js';
import { showLoading } from '../js/util/loading-screen.js';
import * as Chart from '../js/chart.js';

const SIMPLE_ONE_URL = window.appConfig.SIMPLE_ONE_URL;
const BACKEND_URL = window.appConfig.BACKEND_URL;
const loginPage = '/account/login';
const buttonsData = [
    {
        id: 'update-sprint-statuses-btn',
        icon: '/icons/arrows-rotate-solid.svg',
        alt: 'Обновить статусы',
        text: 'Обновить статусы'
    },
    {
        id: 'get-closed-task',
        icon: '/icons/plus-solid.svg',
        alt: 'Добавить задачу',
        text: 'Добавить задачу'
    },
];

export async function loadSprintData() {
    let token = localStorage.getItem('accessToken');
    showLoading('task-table-body');
    try {
        let url = new URL(BACKEND_URL + '/api/v1/sprints/current');
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let sprint = await response.json();

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (!response.ok) {
            showNotification('Ошибка при получении спринта', 'error');
            return;
        }

        // сохраняем id текущего спринта в localStorage
        localStorage.setItem('currentSprintId', sprint.id);

        let tasks = sprint.tasks; // извлекаем массив задач
        let taskContainer = document.getElementById('task-table-body');
        

        renderSprintData(sprint);

        // очищаем контейнер перед добавлением новых задач
        taskContainer.innerHTML = '';

        // создаем элементы для каждой задачи
        tasks.forEach((task) => {
            let taskElement = renderTasks(task);
            taskContainer.appendChild(taskElement);
        });

        // инициализируем диаграммы
        loadCharts(sprint.id);
    } catch (error) {
        console.error('Ошибка при получении спринта:', error);
    }
}

export function loadCharts(sprintId) {
    // создаем пустые диаграммы
    Chart.createStatusChart(sprintId);
    Chart.createPriorityChart(sprintId);
    Chart.createAssigneeChart(sprintId);
    Chart.createStoryPointsChart(sprintId);
    Chart.createClientsChart(sprintId);
    Chart.createAuthorsChart(sprintId);

    // загружаем данные для диаграмм
    Chart.fetchStatuses(sprintId);
    Chart.fetchPriorityData(sprintId);
    Chart.fetchAssigneeData(sprintId);
    Chart.fetchStoryPointsData(sprintId);
    Chart.fetchClientsData(sprintId);
    Chart.fetchAuthorsData(sprintId);
}

function createCharts(sprint) {
    let chartsContainer = document.getElementById('sprint-charts-container');

    // очищаем контейнер перед добавлением новых диаграмм
    chartsContainer.innerHTML = '';

    // создаем разметку для диаграмм
    let chartsHTML = `
        <div class='chart-container-card'>
            <h4 class='chart-title'>Статусы задач</h4>
                <div class='chart-container'>
                    <canvas id='statusChart-${sprint.id}'></canvas>
                </div>
        </div>
        <div class='chart-container-card'>
            <h4 class='chart-title'>Приоритеты задач</h4>
                <div class='chart-container'>
                    <canvas id='priorityChart-${sprint.id}'></canvas>
                </div>
        </div>
        <div class='chart-container-card'>
            <h4 class='chart-title'>Количество задач</h4>
                <div class='chart-container'>
                    <canvas id='assigneeChart-${sprint.id}'></canvas>
                </div>
        </div>
        <div class='chart-container-card'>
            <h4 class='chart-title'>Оценка сложности задач</h4>
                <div class='chart-container'>
                    <canvas id='storyPointsChart-${sprint.id}'></canvas>
                </div>
        </div>
        <div class='chart-container-card'>
            <h4 class='chart-title'>Клиенты</h4>
                <div class='chart-container'>
                    <canvas id='clientsChart-${sprint.id}'></canvas>
                </div>
        </div>
        <div class='chart-container-card'>
            <h4 class='chart-title'>Количество CHG от авторов</h4>
                <div class='chart-container'>
                    <canvas id='authorsChart-${sprint.id}'></canvas>
                </div>
        </div>
    `;

    chartsContainer.innerHTML = chartsHTML;
}

/*
// функция для отрисовки всех задач
export async function renderTasksForSprint() {
    let token = localStorage.getItem('accessToken');
    let currentSprintId = localStorage.getItem('currentSprintId');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/sprints/' + currentSprintId);
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
            showNotification('Ошибка при получении спринта', 'error');
            return;
        }

        let data = await response.json();
        renderSprintData(data);

        let tasks = data.tasks; // извлекаем массив задач
        let taskContainer = document.getElementById('task-table-body');

        // очищаем контейнер перед добавлением новых задач
        taskContainer.innerHTML = '';

        // создаем элементы для каждой задачи
        tasks.forEach((task) => {
            let taskElement = renderTasks(task);
            taskContainer.appendChild(taskElement);
        });

        createCharts(data);
    } catch (error) {
        console.error('Ошибка при получении спринта:', error);
        showNotification('Ошибка при получении спринта', 'error');
    }
}
*/

// функция для синхронизации с SimpleOne
export async function synchronizeTasksWithSimpleOne() {
    let token = localStorage.getItem('accessToken');
    let currentSprintId = localStorage.getItem('currentSprintId');
    let updateStatusesButton = document.getElementById('update-sprint-statuses-btn');

    updateStatusesButton.disabled = true;
    updateStatusesButton.classList.add('opacity-50', 'cursor-not-allowed');

    showLoading('task-table-body');
    try {
        let url = new URL(BACKEND_URL + '/api/v1/sprints/sync/' + currentSprintId);
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
            showNotification('Ошибка при обновлении статусов', 'error');
            return;
        }

        let data = await response.json();
        renderSprintData(data);

        let tasks = data.tasks; // извлекаем массив задач
        let taskContainer = document.getElementById('task-table-body');

        // очищаем контейнер перед добавлением новых задач
        taskContainer.innerHTML = '';

        // создаем элементы для каждой задачи
        tasks.forEach((task) => {
            let taskElement = renderTasks(task);
            taskContainer.appendChild(taskElement);
        });

        showNotification('Статусы обновлены!', 'success');
        updateStatusesButton.disabled = false;
        updateStatusesButton.classList.remove('opacity-50', 'cursor-not-allowed');
    } catch (error) {
        console.error('Ошибка при обновлении статусов:', error);
        showNotification('Ошибка при обновлении статусов', 'error');
    }
}

export function getDaysText(days) {
    let lastDigit = days % 10; // последняя цифра числа
    let lastTwoDigits = days % 100; //пПоследние две цифры числа

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        // исключение: числа 11-14 всегда имеют форму 'дней'
        return `${days} дней`;
    } else if (lastDigit === 1) {
        // числа, заканчивающиеся на 1 (кроме 11)
        return `${days} день`;
    } else if ([2, 3, 4].includes(lastDigit)) {
        // числа, заканчивающиеся на 2, 3 или 4 (кроме 12, 13, 14)
        return `${days} дня`;
    } else {
        // все остальные случаи
        return `${days} дней`;
    }
}

function renderTasks(task) {
  let userRole = localStorage.getItem('userRole');
  let taskItem = document.createElement('div');
  taskItem.className = 'task-item p-4 rounded-lg transition-all duration-300';
  
  if (document.body.classList.contains('dark-theme')) {
    taskItem.classList.add('dark-mode');
  }

  taskItem.setAttribute('data-task-id', task.id);

  let contentWrapper = document.createElement('div');
  contentWrapper.className = 'flex flex-col justify-between';

  let leftContent = document.createElement('div');
  leftContent.className = 'flex-1';

  let headerWrapper = document.createElement('div');
  headerWrapper.className = 'flex justify-between items-center';

  let leftHeader = document.createElement('div');
  leftHeader.className = 'flex items-center';

  if (task.isProject === true) {
    let projectIcon = document.createElement('img');
    projectIcon.src = '/icons/rocket-solid-icon.svg';
    projectIcon.alt = 'Проект';
    projectIcon.className = 'w-4 h-4 mr-2';
    leftHeader.appendChild(projectIcon);
  }

  let label = document.createElement('label');
  label.htmlFor = `task-subject-${task.id}`;
  label.className = 'font-medium';
  label.textContent = task.subject;
  leftHeader.appendChild(label);

  headerWrapper.appendChild(leftHeader);

  let statusBadge = document.createElement('span');
  statusBadge.id = `task-status-${task.id}`;
  statusBadge.className = getStatusClass(task.status);
  statusBadge.textContent = task.status;

  headerWrapper.appendChild(statusBadge);
  leftContent.appendChild(headerWrapper);

  let detailsWrapper = document.createElement('div');
  detailsWrapper.className = 'mt-2 flex items-center text-sm text-gray-500';

  let taskNumber = document.createElement('a');
  taskNumber.href = SIMPLE_ONE_URL + task.externalId;
  taskNumber.target = '_blank';
  taskNumber.rel = 'noopener noreferrer';
  taskNumber.className = 'task-link mr-3 hover:underline';
  taskNumber.textContent = task.number;
  detailsWrapper.appendChild(taskNumber);

  // Создаём отдельный контейнер для исполнителя с id
  let responsibleContainer = document.createElement('div');
  responsibleContainer.id = `task-responsible-${task.id}`;
  responsibleContainer.className = 'flex items-center mr-4';

  let responsibleIcon = document.createElement('img');
  responsibleIcon.src = '/icons/circle-user-solid.svg';
  responsibleIcon.alt = 'Исполнитель';
  responsibleIcon.className = 'w-3 h-3 mr-1';

  let responsibleText = document.createElement('span');
  responsibleText.className = 'mr-4';
  responsibleText.textContent = task.responsible || 'Не назначен';

  responsibleContainer.appendChild(responsibleIcon);
  responsibleContainer.appendChild(responsibleText);

  detailsWrapper.appendChild(responsibleContainer);

  // Добавляем остальные детали задачи
  detailsWrapper.appendChild(createDetail('/icons/user-tag-solid.svg', 'Заявитель', task.author));
  detailsWrapper.appendChild(createDetail('/icons/flag-solid.svg', 'Приоритет', task.priority));
  detailsWrapper.appendChild(createDetail('/icons/address-book-solid.svg', 'Клиент', task.client || 'NO CLIENT'));

  leftContent.appendChild(detailsWrapper);
  contentWrapper.appendChild(leftContent);

  let rightContent = document.createElement('div');
  rightContent.className = 'flex flex-col space-y-2';

  let bottomTask = document.createElement('div');
  bottomTask.className = 'flex justify-between items-center mt-2';

  let commentWrapper = document.createElement('div');
  commentWrapper.id = `task-comment-${task.id}`;
  commentWrapper.className = 'text-sm';
  commentWrapper.textContent = task.comment || '';

  let storyPointsWrapper = document.createElement('div');
  storyPointsWrapper.id = `task-story-points-${task.id}`;
  storyPointsWrapper.className = 'text-bold';
  storyPointsWrapper.textContent = task.storyPoints || 0;

  bottomTask.appendChild(commentWrapper);
  bottomTask.appendChild(storyPointsWrapper);
  rightContent.appendChild(bottomTask);
  contentWrapper.appendChild(rightContent);

  taskItem.appendChild(contentWrapper);

  if (userRole === 'ADMIN' || userRole === 'USER') {
    taskItem.addEventListener('click', function () {
        openEditModal(this);
    });
  }

  return taskItem;
}

function createDetail(iconSrc, alt, text) {
  let icon = document.createElement('img');
  icon.src = iconSrc;
  icon.alt = alt;
  icon.className = 'w-3 h-3 mr-1';

  let span = document.createElement('span');
  span.className = 'mr-4';
  span.textContent = text;

  let container = document.createElement('div');
  container.className = 'flex items-center mr-4';
  container.appendChild(icon);
  container.appendChild(span);
  return container;
}

// Функция для применения темы к уже созданным элементам
export function applyThemeToElements() {
  const taskItems = document.querySelectorAll('.task-item');
  taskItems.forEach(item => {
    if (document.body.classList.contains('dark-theme')) {
      item.classList.add('dark-mode');
    } else {
      item.classList.remove('dark-mode');
    }
  });
}

// вывод данных о спринте на главный лист
function renderSprintData(data) {
    let sumTasksContainer = document.getElementById('tasks-sum-container');
    let sumStoryPointsContainer = document.getElementById('story-points-sum-container');
    let sumSprintDurationContainer = document.getElementById('sprint-duration-container');
    let sprintDatesContainer = document.getElementById('sprint-name-dates');
    let sprintNameContainer = document.getElementById('current-sprint-name');
    let activitySpan = document.getElementById('current-sprint-activity');
    let responsibleForSprint = document.getElementById('sprint-responsible-container');
    let userRole = localStorage.getItem('userRole');
    let buttonsContainer = document.getElementById('sprint-buttons-container');

    buttonsContainer.innerHTML = '';

    if (userRole === 'ADMIN' || userRole === 'USER') {
        // отрисовываем кнопки
        buttonsData.forEach((buttonData) => {
            let button = createButton(buttonData);
            buttonsContainer.appendChild(button);
        });

        // нажатие на кнопку обновления статусов
        document.getElementById('update-sprint-statuses-btn').addEventListener('click', () => {
            synchronizeTasksWithSimpleOne();
        });

        getClosedTask();
    }

    let start = new Date(data.startDate);
    let end = new Date(data.endDate);
    let startDate = parseDate(data.startDate);
    let endDate = parseDate(data.endDate);
    let isSprintActive;

    if (isNaN(data.isActive)) {
        isSprintActive = false;
    } else {
        isSprintActive = data.isActive;
    }

    // вычисляем разницу в миллисекундах
    let timeDifference = end - start;

    // переводим миллисекунды в дни и вызываем метод для добавления слово 'дней'
    let daysDifference = getDaysText(Math.floor(timeDifference / (1000 * 60 * 60 * 24)));

    responsibleForSprint.innerHTML = `
            <div class='large-text'>
                <div>${data.responsible?.name + " " + data.responsible?.surname || 'Не назначен'}</div>
            </div>
        `;

    sumTasksContainer.innerHTML = `
            <div class='large-text'>
                <div>${data.tasksCount || 0}</div>
            </div>
        `;

    sumStoryPointsContainer.innerHTML = `
            <div class='large-text'>
                <div>${data.storyPointsSum || 0}</div>
            </div>
        `;

    if (Number.isNaN(daysDifference)) {
        sumSprintDurationContainer.innerHTML = `
                <div class='large-text'>
                    <div>${0}</div>
                </div>
            `;
    } else {
        sumSprintDurationContainer.innerHTML = `
                <div class='large-text'>
                    <div>${daysDifference}</div>
                </div>
            `;
    }

    if (Number.isNaN(data.startDate) || Number.isNaN(data.endDate)) {
        sprintDatesContainer.innerHTML = `
                <div class='large-text'>
                    <div>${'Даты спринта'}</div>
                </div>
            `;
    } else {
        sprintDatesContainer.innerHTML = `
                <div class='large-text'>
                    <div>${startDate + ' - ' + endDate}</div>
                </div>
            `;
    }

    sprintNameContainer.innerHTML = `
            <div class='large-text'>
                <div>${data.sprintName || 'Нет текущих спринтов'}</div>
            </div>
        `;

    let progress = getProgressPercentage(start, end);

    document.getElementById('sprint-percent-text').textContent = `${Math.round(progress) || 0}%`;
    document.getElementById('sprint-progress-bar').style.width = `${progress}%`;

    createCharts(data);
    activitySpan.classList.add('activity-badge');

    // обновляем текст и классы в зависимости от значения переменной
    if (isSprintActive === false) {
        activitySpan.textContent = 'Completed';
        activitySpan.classList.remove('activity-active');
        activitySpan.classList.add('activity-completed');
    } else {
        activitySpan.textContent = 'Active';
        activitySpan.classList.remove('activity-completed');
        activitySpan.classList.add('activity-active');
    }
}

// включение режима редактирования
function openEditModal(taskItem) {
    let taskId = taskItem.getAttribute('data-task-id');

    let subjectElement = taskItem.querySelector(`label[for='task-subject-${taskId}']`);
    let subject = subjectElement ? subjectElement.textContent.trim() : 'Редактирование задачи';

    let status = taskItem.querySelector(`#task-status-${taskId}`).textContent.trim();
    let responsible = taskItem.querySelector(`#task-responsible-${taskId}`).textContent.trim();
    let comment = taskItem.querySelector(`#task-comment-${taskId}`).textContent.trim();
    let storyPoints = taskItem.querySelector(`#task-story-points-${taskId}`).textContent.trim();

    let taskLinkElement = taskItem.querySelector('.task-link');
    let taskNumber = taskLinkElement.textContent.trim();
    let taskUrl = taskLinkElement.getAttribute('href');

    let applicantDiv = Array.from(taskItem.querySelectorAll('.flex.items-center')).find(div => {
        let img = div.querySelector('img');
        return img && img.getAttribute('alt') === 'Заявитель';
    });
    let applicantName = applicantDiv ? applicantDiv.querySelector('span').textContent.trim() : null;

    let priorityDiv = Array.from(taskItem.querySelectorAll('.flex.items-center')).find(div => {
        let img = div.querySelector('img');
        return img && img.getAttribute('alt') === 'Приоритет';
    });
    let priority = priorityDiv ? priorityDiv.querySelector('span').textContent.trim() : null;

    const taskLink = `<a href="${taskUrl}" target="_blank" rel="noopener noreferrer" class="task-link">${taskNumber}</a>`;

    const editModeNumber = document.getElementById('edit-mode-number');
    if (editModeNumber) {
        editModeNumber.innerHTML = taskLink;
    }

    const editModeSubject = document.getElementById('edit-mode-subject');
    if (editModeSubject) {
        editModeSubject.textContent = subject;
    }

    document.getElementById('modal-caller').value = applicantName;
    document.getElementById('modal-priority').value = priority;
    document.getElementById('modal-status').value = status;
    document.getElementById('modal-responsible').value = responsible;
    document.getElementById('modal-comment').value = comment;
    document.getElementById('modal-story-points').value = storyPoints;

    let editModal = document.getElementById('edit-modal');
    editModal.setAttribute('data-task-id', taskId);
    editModal.classList.remove('hidden');
}

// функция для закрытия модального окна
function closeEditModal() {
    let editModal = document.getElementById('edit-modal');
    editModal.classList.add('hidden'); // добавляем класс hidden
}

document.getElementById('edit-modal')?.addEventListener('click', function (event) {
    if (event.target === this) {
        closeEditModal();
    }
});

document.getElementById('cancel-edit')?.addEventListener('click', function (event) {
    if (event.target === this) {
        closeEditModal();
    }
});

// обработчик нажатия на кнопку удаления задачи
document.getElementById('delete-edit').addEventListener('click', function () {
    let editModal = document.getElementById('edit-modal');
    let taskId = editModal.getAttribute('data-task-id');
    deleteTask(taskId);
});

// сохранение изменений
document.getElementById('save-edit').addEventListener('click', function () {
    let editModal = document.getElementById('edit-modal');
    let taskId = editModal.getAttribute('data-task-id');

    // получаем новые значения из модального окна
    let newStatus = document.getElementById('modal-status').value;
    let newResponsible = document.getElementById('modal-responsible').value;
    let newComment = document.getElementById('modal-comment').value;
    let newStoryPoints = document.getElementById('modal-story-points').value;

    // находим задачу в DOM
    let taskItem = document.querySelector(`.task-item[data-task-id='${taskId}']`);
    taskItem.querySelector(`#task-status-${taskId}`).textContent = newStatus;
    taskItem.querySelector(`#task-responsible-${taskId}`).textContent = newResponsible;
    taskItem.querySelector(`#task-comment-${taskId}`).textContent = newComment;
    taskItem.querySelector(`#task-story-points-${taskId}`).textContent = newStoryPoints;

    sendTaskToSave(taskId, {
        status: newStatus,
        responsible: newResponsible,
        comment: newComment,
        storyPoints: newStoryPoints,
    });

    // закрываем модальное окно
    closeEditModal();
});

// функция для отправки задачи на сохранение
async function sendTaskToSave(taskId, updatedTask) {
    let token = localStorage.getItem('accessToken');
    let currentSprintId = localStorage.getItem('currentSprintId');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/tasks/' + taskId + '/sprints/' + currentSprintId);
        let response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (!response.ok) {
            showNotification('Ошибка при сохранении задачи', 'error');
            return;
        } else {
            showNotification('Данные успешно обновлены');
        }

        let result = await response.json();
    } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        showNotification('Ошибка при обновлении задачи', 'error');
    }
}

// удаление задачи
async function deleteTask(taskId) {
    let token = localStorage.getItem('accessToken');
    let currentSprintId = localStorage.getItem('currentSprintId');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/sprints/' + currentSprintId + '/delete/tasks/' + taskId);
        let response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (!response.ok) {
            showNotification('Ошибка при удалении задачи', 'error');
            closeEditModal();
            return;
        } else {
            closeEditModal();
            showNotification('Задача удалена из спринта', 'success');
        }
    } catch (error) {
        closeEditModal();
        console.error('Ошибка при удалении задачи:', error);
        showNotification('Ошибка при удалении задачи', 'error');
    }
    let task = document.getElementById(`task-${taskId}`);
    if (task) task.remove();
}

function getClosedTask() {
    let modal = document.getElementById('find-task-modal');
    let openModalButton = document.getElementById('get-closed-task');
    let closeModalButton = document.getElementById('close-modal');
    let findTaskButton = document.getElementById('find-external-task');
    let searchInput = document.getElementById('task-search-input');

    // открытие модального окна
    openModalButton.addEventListener('click', function () {
        modal.classList.remove('hidden');
    });

    // закрытие модального окна
    closeModalButton.addEventListener('click', function () {
        modal.classList.add('hidden');
        searchInput.value = ''; // очистка поля ввода
    });

    // обработка кнопки 'Найти'
    findTaskButton.addEventListener('click', function () {
        let taskNumber = searchInput.value.trim();
        getTaskFromSimpleOne(taskNumber);
        modal.classList.add('hidden'); // закрываем модальное окно
        searchInput.value = ''; // очистка поля ввода
    });
}

// функция для отправки запроса на поиск задачи по номеру в SimpleOne
async function getTaskFromSimpleOne(number) {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/tasks/import');
        url.searchParams.append('number', number);
        let response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (!response.ok) {
            showNotification('Ошибка при отправке запроса в SimpleOne', 'error');
            return;
        } else {
            showNotification('Задача добавлена в текущий спринт', 'success');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса в SimpleOne:', error);
        showNotification('Ошибка при отправке запроса в SimpleOne', 'error');
    }
}

// функция для определения класса статуса
function getStatusClass(status) {
    switch (status) {
        case 'Scheduled':
            return 'status-scheduled inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'Waiting for validation':
            return ' status-waiting-for-validation inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'Registered':
            return 'status-registered inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'Delivered/Testing':
            return 'status-delivered-testing inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'In Progress':
            return 'status-in-progress inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'Done':
            return 'status-done inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'Cancelled':
            return 'status-cancelled inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'Implemented':
            return 'status-implemented inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        default:
            return 'status-default inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
    }
}