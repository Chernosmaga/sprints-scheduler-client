import { showNotification } from './util/notification.js';
import { getProgressPercentage, parseDate } from './util/util.js';
import { getDaysText, loadCharts } from './sprint.js';

const simpleOneUrl = 'https://fmlogistic.simpleone.ru/record/itsm_change_request/';
const backendUrl = 'http://localhost:8080';
const loginPage = '/account/login';
let allSprints = [];
let currentSprintId = null;
let currentOffset = 0;
const sprintLimit = 10;

export async function renderData() {
    let token = localStorage.getItem('accessToken');
    try {
        let url = `${backendUrl}/api/v1/history/sprints?page=${currentOffset}&size=${sprintLimit}`;
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
        button.className = 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none w-full mt-4';
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

        let url = new URL(backendUrl + '/api/v1/sprints/' + sprintId);
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
    let container = document.getElementById('history-sprint-content');

    if (!container) {
        console.error('Container with id=history-sprint-content not found');
        return;
    }

    container.innerHTML = '';

    // добавляем новые спринты в глобальную переменную с проверкой на дубликаты
    allSprints = [
        ...allSprints,
        ...sprints.filter(newSprint => !allSprints.some(existingSprint => existingSprint.id === newSprint.id))
    ];

    // создание карточек спринтов
    let sprintCards = sprints.map((sprint) => {
        let startDate = parseDate(sprint.startDate);
        let endDate = parseDate(sprint.endDate);
        let progress = getProgressPercentage(new Date(sprint.startDate), new Date(sprint.endDate));
        let progressPercentage = Math.round(progress);

        return `
            <div class='sprint-card bg-white rounded-lg shadow overflow-hidden transition-all duration-300 cursor-pointer'
                 data-id='${sprint.id}' onclick="openSprint('${sprint.id}')">
                    <div class='p-6'>
                        <div class='mb-4'>
                            <div class='inline-block items-center'>
                                <h3 id='current-sprint-name' class='text-xl font-semibold text-gray-800 inline-block'>${sprint.sprintName}</h3>
                                <h3 id='sprint-name-dates' class='text-gray-600 ml-5 inline-block'>${startDate} - ${endDate}</h3>
                            </div>
                            <span id='current-sprint-activity' class='px-3 py-1 rounded-full text-sm font-medium ${getStatusLabelClass(sprint.isActive)} text-green-800 inline-block float-right'>
                                ${getStatusText(sprint.isActive)}
                            </span>
                    </div>

                    <div class='mb-4'>
                        <p class='text-gray-700 text-sm'>
                            <span class='ont-medium'>${sprint.responsible?.name || 'Не назначен'}</span>
                        </p>
                    </div>

                    <!-- Прогресс -->
                    <div class='mb-4'>
                        <div class='flex justify-between mb-1'>
                            <span class='text-xs font-medium text-gray-700'>Progress</span>
                            <span class='text-xs font-medium text-gray-700'>${progressPercentage}%</span>
                        </div>
                        <div class='w-full bg-gray-200 rounded-full h-1.5'>
                            <div class='bg-purple-600 h-1.5 rounded-full' style='width: ${progressPercentage}%'></div>
                        </div>
                    </div>

                    <!-- Задачи и сложность -->
                    <div class='flex justify-between text-sm'>
                        <div>
                            <span class='text-gray-500'>Tasks:</span>
                            <span class='font-medium ml-1'>${sprint.tasksCount || 0}</span>
                        </div>
                        <div>
                            <span class='text-gray-500'>Points:</span>
                            <span class='font-medium ml-1'>${sprint.storyPointsSum || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // добавляем карточки спринтов в контейнер
    container.innerHTML += sprintCards;

    // добавляем кнопку 'Загрузить ещё' в конец контейнера
    if (sprints.length > 10) {
        let loadMoreButton = `
            <div class='flex justify-center mt-4'>
                <button id='load-more-button' class='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none'>
                    Загрузить ещё
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', loadMoreButton);

        // обработчик события на кнопку
        let button = container.querySelector('#load-more-button');
        if (button) {
            button.addEventListener('click', async () => {
                await renderData();
            });
        }
    } else {
        // если больше спринтов нет, удаляем кнопку
        let existingButton = container.querySelector('#load-more-button');
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
        <div class='bg-white rounded-lg shadow overflow-hidden'>
            <div class='p-6 relative'>
                <div class='relative flex flex-col items-center'>
                    <button
                        class='absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-3 rounded-md'
                        onclick='goBackToSprintList()'
                    >
                        Назад
                    </button>

                    <span
                        id='history-sprint-activity'
                        class='absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${isSprintActive ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}'
                    >
                        ${isSprintActive ? 'Active' : 'Completed'}
                    </span>

                    <h3 class='text-xl font-semibold text-gray-800 text-center mb-4 ml-[-40px]'>${sprint.sprintName || 'Нет текущих спринтов'}</h3>
                    <p class='text-gray-600 text-sm text-center mb-4 ml-[-40px]'>
                        ${Number.isNaN(sprint.startDate) || Number.isNaN(sprint.endDate) ? 'Даты спринта' : `${startDate} - ${endDate}`}
                    </p>
                </div>

                <div class='overflow-x-auto'>
                    <table class='min-w-full divide-y divide-gray-200'>
                        <thead class='bg-gray-50'>
                        <tr>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Number</th>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Author</th>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Client</th>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Responsible</th>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Priority</th>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Story Points</th>
                            <th scope='col' class='px-6 py-3 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider'>Comment</th>
                        </tr>
                        </thead>
                        <tbody id='history-task-table-body' class='bg-white divide-y divide-gray-200'>
                        </tbody>
                    </table>
                </div>

                <div class='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 mt-8'>
                    <div class='bg-gray-50 p-2 rounded-md w-full h-20 flex flex-col justify-center items-center'>
                        <h4 class='text-xs font-medium text-gray-500 mb-1'>Ответственный</h4>
                        <div class='text-sm font-medium'>${sprint.responsible?.name || 'Не назначен'}</div>
                    </div>
                    <div class='bg-gray-50 p-2 rounded-md w-full h-20 flex flex-col justify-center items-center'>
                        <h4 class='text-xs font-medium text-gray-500 mb-1'>Задачи</h4>
                        <div class='text-sm font-medium'>${sprint.tasksCount || 0}</div>
                    </div>
                    <div class='bg-gray-50 p-2 rounded-md w-full h-20 flex flex-col justify-center items-center'>
                        <h4 class='text-xs font-medium text-gray-500 mb-1'>Сложность</h4>
                        <div class='text-sm font-medium'>${sprint.storyPointsSum || 0}</div>
                    </div>
                    <div class='bg-gray-50 p-2 rounded-md w-full h-20 flex flex-col justify-center items-center'>
                        <h4 class='text-xs font-medium text-gray-500 mb-1'>Длительность</h4>
                        <div class='text-sm font-medium'>${Number.isNaN(daysDifference) ? 0 : daysDifference}</div>
                    </div>
                </div>

                <div class='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
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
        <td class='px-4 py-2 text-xs'>
            <a href='${simpleOneUrl + task.externalId}' target='_blank' rel='noopener noreferrer' class='text-blue-500 hover:underline'>${task.number}</a>
        </td>

        <td class='px-4 py-2 text-xs'>${task.author}</td>
        <td class='px-4 py-2 text-xs editable' data-field='status'>${task.status}</td>

        <td class='px-4 py-2 relative client-cell'>
            <span class='client-name text-xs'>${task.client}</span>
            <span class='subject hidden text-gray-700 text-xs absolute top-1/2 -translate-y-1/2 left-full ml-2 px-3 py-2 bg-gray-100 rounded-md shadow-md'></span>
        </td>

        <td class='px-4 py-2 text-xs editable' data-field='responsible'>${task.responsible || 'Не назначен'}</td>
        <td class='px-4 py-2 text-xs'>${task.priority || 'Нет приоритета'}</td>
        <td class='px-4 py-2 text-xs editable' data-field='storyPoints'>${task.storyPoints || '0'}</td>
        <td class='px-4 py-2 text-xs editable' data-field='comment'>${task.comment || ''}</td>
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

function getStatusLabelClass(isActive) {
    if (isActive === false) {
        return 'bg-purple-100 text-purple-800';
    }
    if (isActive === true) {
        return 'bg-green-100 text-green-800';
    }
}

function getStatusText(isActive) {
    if (isActive === false) {
        return 'Completed';
    }
    if (isActive === true) {
        return 'Active';
    }
}