import { showNotification } from './util/notification.js';
import { getProgressPercentage, parseDate } from './util/util.js';
import { showHistoryLoading } from '../js/util/loading-screen.js';
import { getDaysText, loadCharts } from './sprint.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const SIMPLE_ONE_URL = window.appConfig.SIMPLE_ONE_URL;
const loginPage = '/account/login';
let allSprints = [];
let currentOffset = 0;
const sprintLimit = 10;

export async function renderData() {
    let token = localStorage.getItem('accessToken');
    showHistoryLoading();

    try {
        let url = `${BACKEND_URL}/api/v1/history/sprints?page=${currentOffset}&size=${sprintLimit}`;
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        refreshToken(response);

        if (!response.ok) {
            showNotification('Ошибка при получении данных', 'error');
        }
        let sprints = await response.json();

        // если это первая загрузка, очищаем контейнер
        if (currentOffset === 0) {
            document.getElementById('history-sprint-content').innerHTML = '';
        }

        // отрисовываем спринты
        renderSprints(sprints);

        // увеличиваем смещение для следующей загрузки
        if (sprints.length === sprintLimit) {
            currentOffset += sprintLimit;
        }

        // если спринтов больше нет, скрываем кнопку 'Загрузить ещё'
        if (sprints.length < sprintLimit) {
            hideLoadMoreButton();
        } else {
            showLoadMoreButton();
        }
    } catch (error) {
        console.error(error.message);
        showNotification('Ошибка при получении данных', 'error');
    }
}

// функция для отображения кнопки 'Загрузить ещё'
function showLoadMoreButton() {
    let loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.style.display = 'block';
    } else {
        // создаем кнопку, если её ещё нет
        let container = document.getElementById('history-sprint-content');
        let button = document.createElement('button');
        button.id = 'load-more-button';
        button.className = 'load-more-button';
        button.textContent = 'Загрузить ещё';
        button.addEventListener('click', renderData); // добавляем обработчик события
        container.appendChild(button);
    }
}

// функция для скрытия кнопки 'Загрузить ещё'
function hideLoadMoreButton() {
    let loadMoreButton = document.getElementById('load-more-button');
    if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
    }
}

// открытие спринта
window.openSprint = async function (sprintId) {
    let token = localStorage.getItem('accessToken');
    try {
        // обновляем URL с sprintId
        updateUrlWithSprintId(sprintId);

        let url = new URL(BACKEND_URL + '/api/v1/sprints/' + sprintId);
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        refreshToken(response);

        if (!response.ok) {
            showNotification('Ошибка при получении спринта', 'error');
        }
        let sprint = await response.json();

        renderSprintDetails(sprint);
        loadCharts(sprint.id);
    } catch (error) {
        console.error('Ошибка при получении спринта:', error);
        showNotification('Ошибка при получении спринта', 'error');
    }
};

function renderSprints(sprints) {
    let container = document.getElementById("history-sprint-content");

    if (!container) {
        console.error("Container with id=history-sprint-content not found");
        return;
    }

    container.innerHTML = "";

    // добавляем новые спринты в глобальную переменную с проверкой на дубликаты
    allSprints = [...allSprints, ...sprints.filter((newSprint) => !allSprints.some((existingSprint) => existingSprint.id === newSprint.id))];

    // создание карточек спринтов
    let sprintCards = sprints
        .map((sprint) => {
            let startDate = parseDate(sprint.startDate);
            let endDate = parseDate(sprint.endDate);
            let progress = getProgressPercentage(new Date(sprint.startDate), new Date(sprint.endDate));
            let progressPercentage = Math.round(progress);

            return `
                <div class="sprint-card" data-id='${sprint.id}' onclick="openSprint('${sprint.id}')">
                    <div class='p-6'>
                        <div class='mb-4 flex justify-between items-center'>
                            <div class="history-sprint-title-wrapper">
                                <h3 id='current-sprint-name' class='history-sprint-title'>${sprint.sprintName}</h3>
                                <h3 id='sprint-name-dates' class='history-sprint-dates'>${startDate} - ${endDate}</h3>
                            </div>
                            <span id='current-sprint-activity' class='status-label ${sprint.isActive ? "active" : "inactive"}'>
                                ${getStatusText(sprint.isActive)}
                            </span>
                        </div>

                        <div class='mb-4 responsible-info'>
                            <p class='text-sm'>
                                <span class='font-medium'>${sprint.responsible?.name || "Не назначен"}</span>
                            </p>
                        </div>

                        <div class='mb-4 progress-container'>
                            <div class='flex justify-between mb-1 progress-labels'>
                                <span class='progress-text'>Progress</span>
                                <span class='progress-text'>${progressPercentage}%</span>
                            </div>
                            <div class='w-full progress-bar'>
                                <div class='progress-fill' style='width: ${progressPercentage}%'></div>
                            </div>
                        </div>

                        <div class='flex justify-between text-sm stats-container flex-nowrap'>
                            <div>
                                <span class='stat-card-value'>Tasks:</span>
                                <span class='font-medium ml-1'>${sprint.tasksCount || 0}</span>
                            </div>
                            <div>
                                <span class='stat-card-value'>Points:</span>
                                <span class='font-medium ml-1'>${sprint.storyPointsSum || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
        `;
        })
        .join("");

    // добавляем карточки спринтов в контейнер
    container.innerHTML += sprintCards;

    // добавляем кнопку 'Загрузить ещё' в конец контейнера
    if (sprints.length > 10) {
        let loadMoreButton = `
            <div class='flex justify-center mt-4'>
                <button id='load-more-button' class='load-more-button'>
                    Загрузить ещё
                </button>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", loadMoreButton);

        // обработчик события на кнопку
        let button = container.querySelector("#load-more-button");
        if (button) {
            button.addEventListener("click", async () => {
                await renderData();
            });
        }
    } else {
        // если больше спринтов нет, удаляем кнопку
        let existingButton = container.querySelector("#load-more-button");
        if (existingButton) {
            existingButton.remove();
        }
    }
}


// функция для обновления URL с параметром sprintId
function updateUrlWithSprintId(sprintId) {
    let url = new URL(window.location);
    if (sprintId) {
        url.searchParams.set('sprintId', sprintId);
    } else {
        url.searchParams.delete('sprintId');
    }
    window.history.pushState({}, '', url);
}

// функция для возврата к списку спринтов
window.goBackToSprintList = function goBackToSprintList() {
    // перерисовываем список спринтов
    updateUrlWithSprintId();
    renderSprints(allSprints);
}

// функция для отрисовки деталей спринта
function renderSprintDetails(sprint) {
    let container = document.getElementById('history-sprint-content');
    if (!container) {
        console.error('Container with id=history-sprint-content not found');
        return;
    }

    // очищаем контейнер перед добавлением новых данных
    container.innerHTML = '';

    let start = new Date(sprint.startDate);
    let end = new Date(sprint.endDate);
    let startDate = parseDate(sprint.startDate);
    let endDate = parseDate(sprint.endDate);
    let isSprintActive = !isNaN(sprint.isActive) ? sprint.isActive : false;

    // вычисляем разницу в днях
    let timeDifference = end - start;
    let daysDifference = getDaysText(Math.floor(timeDifference / (1000 * 60 * 60 * 24)));

    // создаем HTML-разметку для деталей спринта и таблицы задач
    let sprintDetailsHTML = `
        <div class='history-sprint-container'>
            <div class='p-6 relative'>
                <div class='history-sprint-container'>
                    <div class='history-sprint-columns'>
                        <div class='history-sprint-top-row'>
                            <button class='history-back-button' onclick='goBackToSprintList()'>
                                Назад
                            </button>
                            <div class="history-sprint-title-wrapper">
                                <h3 class='history-sprint-title'>${sprint.sprintName || 'Нет текущих спринтов'}</h3>
                                <p class='history-sprint-dates'>
                                    ${Number.isNaN(sprint.startDate) || Number.isNaN(sprint.endDate) ? 'Даты спринта' : `${startDate} - ${endDate}`}
                                </p>
                            </div>
                            <span id='history-sprint-activity' class='activity-badge ${isSprintActive ? 'activity-active' : 'activity-completed'}'>
                                ${isSprintActive ? 'Active' : 'Completed'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 mt-2'>
                    <div class='stat-card flex items-center justify-between'>
                        <h4 class='stat-card-title'>Ответственный</h4>
                        <div class='stat-card-value'>${sprint.responsible?.name || 'Не назначен'}</div>
                    </div>
                    <div class='stat-card flex items-center justify-between'>
                        <h4 class='stat-card-title'>Задачи</h4>
                        <div class='stat-card-value'>${sprint.tasksCount || 0}</div>
                    </div>
                    <div class='stat-card flex items-center justify-between'>
                        <h4 class='stat-card-title'>Сложность</h4>
                        <div class='stat-card-value'>${sprint.storyPointsSum || 0}</div>
                    </div>
                    <div class='stat-card flex items-center justify-between'>
                        <h4 class='stat-card-title'>Длительность</h4>
                        <div class='stat-card-value'>${Number.isNaN(daysDifference) ? 0 : daysDifference}</div>
                    </div>
                </div>

                <div class='overflow-x-auto'>
                    <table class='history-task-table'>
                        <thead>
                        <tr>
                            <th scope='col' class='history-table-cell'>Number</th>
                            <th scope='col' class='history-table-cell'>Author</th>
                            <th scope='col' class='history-table-cell'>Status</th>
                            <th scope='col' class='history-table-cell'>Client</th>
                            <th scope='col' class='history-table-cell'>Responsible</th>
                            <th scope='col' class='history-table-cell'>Priority</th>
                            <th scope='col' class='history-table-cell'>Story Points</th>
                            <th scope='col' class='history-table-cell'>Comment</th>
                        </tr>
                        </thead>
                        <tbody id='history-task-table-body' class=''>
                        </tbody>
                    </table>
                </div>

                <div class='history-chart-container-grid'>
                    <div class='history-chart-container-card'>
                        <h4 class='history-chart-container-text'>Статусы задач</h4>
                        <div class='chart-container'>
                            <canvas id='statusChart-${sprint.id}'></canvas>
                        </div>
                    </div>
                    <div class='history-chart-container-card'>
                        <h4 class='history-chart-container-text'>Приоритеты задач</h4>
                        <div class='chart-container'>
                            <canvas id='priorityChart-${sprint.id}'></canvas>
                        </div>
                    </div>
                    <div class='history-chart-container-card'>
                        <h4 class='history-chart-container-text'>Количество задач</h4>
                        <div class='chart-container'>
                            <canvas id='assigneeChart-${sprint.id}'></canvas>
                        </div>
                    </div>
                    <div class='history-chart-container-card'>
                        <h4 class='history-chart-container-text'>Оценка сложности задач</h4>
                        <div class='chart-container'>
                            <canvas id='storyPointsChart-${sprint.id}'></canvas>
                        </div>
                    </div>
                    <div class='history-chart-container-card'>
                        <h4 class='history-chart-container-text'>Клиенты</h4>
                        <div class='chart-container'>
                            <canvas id='clientsChart-${sprint.id}'></canvas>
                        </div>
                    </div>
                    <div class='history-chart-container-card'>
                        <h4 class='history-chart-container-text'>Количество CHG от авторов</h4>
                        <div class='chart-container'>
                            <canvas id='authorsChart-${sprint.id}'></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = sprintDetailsHTML;

    // добавляем строки таблицы с задачами
    let taskTableBody = document.getElementById('history-task-table-body');
    if (taskTableBody && sprint.tasks) {
        sprint.tasks.forEach((task) => {
            let taskRow = updateTableRow(task);
            taskTableBody.appendChild(taskRow);
        });
    }
}

function updateTableRow(task) {
    // создаем строку таблицы
    let row = document.createElement('tr');

    // заполняем строку данными
    row.innerHTML = `
        <td class='px-4 py-2 text-sm'>
            <a href='${SIMPLE_ONE_URL + task.externalId}' target='_blank' rel='noopener noreferrer' class='task-link'>${task.number}</a>
        </td>

        <td class='px-4 py-2 text-sm'>${task.author}</td>
        <td class='px-4 py-2 text-sm' data-field='status'>${task.status}</td>

        <td class='px-4 py-2 relative client-cell'>
            <span class='client-name text-sm'>${task.client}</span>
            <span class='subject alternative hidden'></span>
        </td>

        <td class='px-4 py-2 text-sm editable' data-field='responsible'>${task.responsible || 'Не назначен'}</td>
        <td class='px-4 py-2 text-sm'>${task.priority || 'Нет приоритета'}</td>
        <td class='px-4 py-2 text-sm editable' data-field='storyPoints'>${task.storyPoints || '0'}</td>
        <td class='px-4 py-2 text-sm editable' data-field='comment'>${task.comment || ''}</td>
    `;

    // безопасно заполняем текстовые поля
    let subject = row.querySelector('.subject');
    if (subject) subject.textContent = task.subject;

    // добавляем обработчики событий для показа/скрытия subject
    let clientCell = row.querySelector('.client-cell');
    if (clientCell && subject) {
        clientCell.addEventListener('mouseenter', () => {
            subject.classList.remove('hidden');
        });

        clientCell.addEventListener('mouseleave', () => {
            subject.classList.add('hidden');
        });
    }

    return row;
}

function getStatusText(isActive) {
    if (isActive === false) {
        return 'Completed';
    }
    if (isActive === true) {
        return 'Active';
    }
}