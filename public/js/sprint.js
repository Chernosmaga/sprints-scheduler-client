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
        text: 'Обновить статусы',
        onClick: () => console.log('Обновить статусы'),
    },
    {
        id: 'get-closed-task',
        icon: '/icons/plus-solid.svg',
        alt: 'Добавить задачу',
        text: 'Добавить задачу',
        onClick: () => console.log('Добавить задачу'),
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
        <div class='bg-gray-50 p-4 rounded-lg'>
            <h4 class='text-sm font-medium text-gray-500 mb-2'>Статусы задач</h4>
                <div class='chart-container'>
                    <canvas id='statusChart-${sprint.id}' width='700' height='400'></canvas>
                </div>
        </div>
        <div class='bg-gray-50 p-4 rounded-lg'>
            <h4 class='text-sm font-medium text-gray-500 mb-2'>Приоритеты задач</h4>
                <div class='chart-container'>
                    <canvas id='priorityChart-${sprint.id}' width='700' height='400'></canvas>
                </div>
        </div>
        <div class='bg-gray-50 p-4 rounded-lg'>
            <h4 class='text-sm font-medium text-gray-500 mb-2'>Количество задач</h4>
                <div class='chart-container'>
                    <canvas id='assigneeChart-${sprint.id}' width='700' height='400'></canvas>
                </div>
        </div>
        <div class='bg-gray-50 p-4 rounded-lg'>
            <h4 class='text-sm font-medium text-gray-500 mb-2'>Оценка сложности задач</h4>
                <div class='chart-container'>
                    <canvas id='storyPointsChart-${sprint.id}' width='700' height='400'></canvas>
                </div>
        </div>
        <div class='bg-gray-50 p-4 rounded-lg'>
            <h4 class='text-sm font-medium text-gray-500 mb-2'>Клиенты</h4>
                <div class='chart-container'>
                    <canvas id='clientsChart-${sprint.id}' width='700' height='400'></canvas>
                </div>
        </div>
        <div class='bg-gray-50 p-4 rounded-lg'>
            <h4 class='text-sm font-medium text-gray-500 mb-2'>Количество CHG от авторов</h4>
                <div class='chart-container'>
                    <canvas id='authorsChart-${sprint.id}' width='700' height='400'></canvas>
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

// функция создания контейнера для задачи
function renderTasks(task) {
    let userRole = localStorage.getItem('userRole');
    // контейнер задачи
    let taskItem = document.createElement('div');
    taskItem.className =
        'task-item bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-indigo-100 transition-all duration-300';
    taskItem.setAttribute('data-task-id', task.id);

    // основное содержимое задачи
    let contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex flex-col justify-between'; // flexbox для вертикального выравнивания

    // левая часть (основная информация)
    let leftContent = document.createElement('div');
    leftContent.className = 'flex-1';

    // заголовок задачи
    let headerWrapper = document.createElement('div');
    headerWrapper.className = 'flex justify-between items-center'; // flexbox для выравнивания по краям

    // левая часть заголовка (иконка проекта + текст)
    let leftHeader = document.createElement('div');
    leftHeader.className = 'flex items-center'; // flexbox для выравнивания иконки и текста

    // иконка проекта (если isProject = true)
    if (task.isProject === true) {
        let projectIcon = document.createElement('img');
        projectIcon.src = '/icons/rocket-solid-icon.svg';
        projectIcon.alt = 'Проект';
        projectIcon.className = 'w-4 h-4 mr-2'; // размер иконки и отступ справа
        leftHeader.appendChild(projectIcon);
    }

    // текст заголовка
    let label = document.createElement('label');
    label.htmlFor = `task-subject-${task.id}`;
    label.className = 'font-medium text-gray-700';
    label.textContent = task.subject;
    leftHeader.appendChild(label);

    // добавляем левую часть заголовка в headerWrapper
    headerWrapper.appendChild(leftHeader);

    // статус задачи (справа)
    let statusBadge = document.createElement('span');
    statusBadge.id = `task-status-${task.id}`;
    statusBadge.className = getStatusClass(task.status);
    statusBadge.textContent = task.status;

    // добавляем статус в headerWrapper
    headerWrapper.appendChild(statusBadge);

    leftContent.appendChild(headerWrapper);

    // дополнительная информация
    let detailsWrapper = document.createElement('div');
    detailsWrapper.className = 'mt-2 flex items-center text-sm text-gray-500';

    // номер задачи
    let taskNumber = document.createElement('a');
    taskNumber.className = 'mr-3 text-indigo-600 hover:underline'; // стили для ссылки
    taskNumber.href = SIMPLE_ONE_URL + task.externalId;
    taskNumber.target = '_blank'; // открывать ссылку в новой вкладке
    taskNumber.rel = 'noopener noreferrer'; // защита от уязвимостей при открытии в новой вкладке
    taskNumber.textContent = task.number; // текст ссылки (номер задачи)
    detailsWrapper.appendChild(taskNumber);

    // заявитель
    let authorIcon = document.createElement('img');
    authorIcon.src = '/icons/user-tag-solid.svg';
    authorIcon.alt = 'Заявитель';
    authorIcon.className = 'w-3 h-3 mr-1';
    detailsWrapper.appendChild(authorIcon);

    let author = document.createElement('span');
    author.id = `task-author-${task.id}`;
    author.className = 'mr-4';
    author.textContent = task.author;
    detailsWrapper.appendChild(author);

    // исполнитель
    let userIcon = document.createElement('img');
    userIcon.src = '/icons/circle-user-solid.svg';
    userIcon.alt = 'Исполнитель';
    userIcon.className = 'w-3 h-3 mr-1';
    detailsWrapper.appendChild(userIcon);

    let responsible = document.createElement('span');
    responsible.id = `task-responsible-${task.id}`;
    responsible.className = 'mr-4';
    responsible.textContent = task.responsible || 'Не назначен';
    detailsWrapper.appendChild(responsible);

    // приоритет задачи
    let priorityIcon = document.createElement('img');
    priorityIcon.src = '/icons/flag-solid.svg';
    priorityIcon.alt = 'Приоритет';
    priorityIcon.className = 'w-3 h-3 mr-1';
    detailsWrapper.appendChild(priorityIcon);

    let taskPriority = document.createElement('span');
    taskPriority.id = `task-priority-${task.id}`;
    taskPriority.className = 'mr-4';
    taskPriority.textContent = task.priority;
    detailsWrapper.appendChild(taskPriority);

    // клиент
    let clientIcon = document.createElement('img');
    clientIcon.src = '/icons/address-book-solid.svg';
    clientIcon.alt = 'Клиент';
    clientIcon.className = 'w-3 h-3 mr-1';
    detailsWrapper.appendChild(clientIcon);

    let client = document.createElement('span');
    client.id = `task-client-${task.id}`;
    client.className = 'mr-4';
    client.textContent = task.client || 'NO CLIENT';
    detailsWrapper.appendChild(client);

    leftContent.appendChild(detailsWrapper);

    // все части вместе
    contentWrapper.appendChild(leftContent);

    // правая часть (дополнительное поле storyPoints и комментарий)
    let rightContent = document.createElement('div');
    rightContent.className = 'flex flex-col space-y-2'; // вертикальное расположение

    // контейнер для storyPoints и комментария
    let bottomTask = document.createElement('div');
    bottomTask.className = 'flex justify-between items-center mt-2'; // горизонтальное расположение

    // комментарий
    let commentWrapper = document.createElement('div');
    commentWrapper.id = `task-comment-${task.id}`;
    commentWrapper.className = 'text-sm text-gray-800';
    commentWrapper.textContent = task.comment || ' ';
    bottomTask.appendChild(commentWrapper);

    // story points
    let storyPointsWrapper = document.createElement('div');
    storyPointsWrapper.id = `task-story-points-${task.id}`;
    storyPointsWrapper.className = 'text-bold text-gray-600';
    storyPointsWrapper.textContent = task.storyPoints || 0;
    bottomTask.appendChild(storyPointsWrapper);

    rightContent.appendChild(bottomTask);

    contentWrapper.appendChild(rightContent);
    taskItem.appendChild(contentWrapper);

    if (userRole === 'ADMIN' || userRole === 'USER') {
        // обработчик клика для редактирования
        taskItem.addEventListener('click', function () {
            openEditModal(this);
        });
    }

    return taskItem;
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

        document.getElementById('get-closed-task').addEventListener('click', (e) => {
            getClosedTask();
        });
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
                <div>${data.responsible?.name || 'Не назначен'}</div>
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

    // обновляем текст и классы в зависимости от значения переменной
    if (isSprintActive === false) {
        activitySpan.textContent = 'Completed';
        activitySpan.classList.remove('bg-green-100', 'text-green-800');
        activitySpan.classList.add('bg-purple-100', 'text-purple-800');
    } else {
        activitySpan.textContent = 'Active';
        activitySpan.classList.remove('bg-purple-100', 'text-purple-800');
        activitySpan.classList.add('bg-green-100', 'text-green-800');
    }
}

// включение режима редактирования
function openEditModal(taskItem) {
    let taskId = taskItem.getAttribute('data-task-id');

    // находим заголовок задачи
    let subjectElement = taskItem.querySelector(`label[for='task-subject-${taskId}']`);
    let subject = subjectElement ? subjectElement.textContent : 'Редактирование задачи';

    // находим остальные поля задачи
    let status = taskItem.querySelector(`#task-status-${taskId}`).textContent;
    let responsible = taskItem.querySelector(`#task-responsible-${taskId}`).textContent;
    let comment = taskItem.querySelector(`#task-comment-${taskId}`).textContent;
    let storyPoints = taskItem.querySelector(`#task-story-points-${taskId}`).textContent;

    // заполняем модальное окно текущими значениями
    document.getElementById('edit-mode-subject').textContent = subject;
    document.getElementById('modal-status').value = status;
    document.getElementById('modal-responsible').value = responsible;
    document.getElementById('modal-comment').value = comment;
    document.getElementById('modal-story-points').value = storyPoints;

    // показываем модальное окно
    let editModal = document.getElementById('edit-modal');
    editModal.setAttribute('data-task-id', taskId);
    editModal.classList.remove('hidden'); // убираем класс hidden
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
    let taskId = modal.getAttribute('data-task-id');
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
            return;
        } else {
            showNotification('Задача удалена из спринта', 'success');
        }
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
        showNotification('Ошибка при удалении задачи', 'error');
    }
    let task = document.getElementById(`task-${taskId}`);
    if (task) task.remove();
}

export function getClosedTask() {
    let modal = document.getElementById('modal');
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
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-800';
        case 'Waiting for validation':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800';
        case 'Registered':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800';
        case 'Delivered/Testing':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800';
        case 'In Progress':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-sky-100 text-sky-800';
        case 'Done':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800';
        case 'Cancelled':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-stone-100 text-stone-800';
        case 'Implemented':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800';
        default:
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-violet-100 text-violet-800';
    }
}