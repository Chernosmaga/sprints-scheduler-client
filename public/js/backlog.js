import { showNotification } from '../js/util/notification.js';
import { createButton } from '../js/util/util.js';
import { showLoading } from '../js/util/loading-screen.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const SIMPLE_ONE_URL = window.appConfig.SIMPLE_ONE_URL;
const loginPage = '/accout/login';
let statusFilter;
let priorityFilter;
let totalTasksCount;
let selectedTasksCount;
let totalPages = 0;
let currentPage = 0; // текущая страница (начинается с 0)
const pageSize = 100; // размер страницы

// маппинг приоритетов
const priorityMapping = {
    'Низкий': 'LOW',
    'Средний': 'MEDIUM',
    'Высокий': 'HIGH'
};

const updateBacklog = {
    id: 'update-backlog-btn',
    icon: '/icons/arrows-rotate-solid.svg',
    alt: 'Обновить бэклог',
    text: 'Обновить бэклог',
    onClick: () => console.log('Обновить бэклог'),
};

const addToSprint = {
    id: 'add-to-sprint',
    icon: '/icons/plus-solid.svg',
    alt: 'Добавить в спринт',
    text: 'Добавить в спринт',
    onClick: () => console.log('Добавить в спринт'),
};

export function loadBacklogData() {
    let userRole = localStorage.getItem('userRole');
    let addToSprintButtonContainer = document.getElementById('add-to-sprint-button-container');
    let updateBacklogButtonContainer = document.getElementById('update-backlog-button-container');
    // инициализация фильтров
    statusFilter = document.getElementById('backlog-status-filter');
    priorityFilter = document.getElementById('backlog-priority-filter');

    let prevPageButton = document.getElementById('backlog-prev-page');
    let nextPageButton = document.getElementById('backlog-next-page');

    if (userRole === 'ADMIN' || userRole === 'USER') {
        renderCheckboxSelectAll();
    }

    // отрисовка задач при первом запросе
    fetchFilteredTasks();

    // добавляем обработчики событий для кнопок пагинации
    prevPageButton.addEventListener('click', () => changePage(-1));
    nextPageButton.addEventListener('click', () => changePage(1));

    // добавляем обработчики событий для фильтров
    statusFilter.addEventListener('change', filterTasks);
    priorityFilter.addEventListener('change', filterTasks);

    addToSprintButtonContainer.innerHTML = '';
    updateBacklogButtonContainer.innerHTML = '';

    if (userRole === 'ADMIN' || userRole === 'USER') {
        // отрисовываем кнопки
        addToSprintButtonContainer.appendChild(createButton(addToSprint));
        updateBacklogButtonContainer.appendChild(createButton(updateBacklog));

        // нажатие на кнопку обновления статусов
        document.getElementById('update-backlog-btn').addEventListener('click', () => {
            synchronizeWithSimpleOne();
        });

        document.getElementById('add-to-sprint').addEventListener('click', (e) => {
            saveSelectedTasks();
        });
    }
}

function renderCheckboxSelectAll() {
    let selectAllContainer = document.getElementById('select-all-container');

    // создаем чекбокс "Выбрать все"
    let checkboxWrapper = document.createElement('label');
    checkboxWrapper.className = 'flex items-center cursor-pointer';

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'select-all-checkbox';
    checkbox.className = 'form-checkbox h-4 w-4 text-indigo-600';

    let label = document.createElement('span');
    label.textContent = 'Выбрать все';
    label.className = 'ml-2 text-gray-400';

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);

    // добавляем чекбокс в контейнер
    selectAllContainer.appendChild(checkboxWrapper);
}

export function filterTasks() {
    resetCounters();
    let prevPageButton = document.getElementById('backlog-prev-page');
    let nextPageButton = document.getElementById('backlog-next-page');
    let pageInfo = document.getElementById('backlog-page-info');

    // получаем текущие значения фильтров
    let selectedStatus = statusFilter.value;
    let selectedPriority = priorityFilter.value;

    // вызываем функцию для фильтрации задач
    fetchFilteredTasks();
    updateCounters();
}

// функция для сброса переменных, если добавлено условие фильтрации
function resetCounters() {
    totalTasksCount = 0;
    selectedTasksCount = 0;
    currentPage = 0;
    totalPages = 0;

    // обнуляем отображаемые значения в DOM
    document.getElementById('total-count').textContent = '0';
    document.getElementById('selected-count').textContent = '0';
}

// обновление счётчиков для вновь отрисованной страницы
function updateCounters() {
    // получаем все задачи и выбранные задачи
    let allTasks = document.querySelectorAll('#backlog-tasks .task-item');
    let selectedTasks = document.querySelectorAll("#backlog-tasks .task-item input[type='checkbox']:checked");

    // обновляем значения счетчиков
    totalTasksCount = allTasks.length;
    selectedTasksCount = selectedTasks.length;

    // обновляем отображаемые значения в DOM
    document.getElementById('total-count').textContent = totalTasksCount;
    document.getElementById('selected-count').textContent = selectedTasksCount;
}

function updatePagination(currentPage, totalPages) {
     let prevButton = document.getElementById('backlog-prev-page');
     let nextButton = document.getElementById('backlog-next-page');
     let pageInfo = document.getElementById('backlog-page-info');

     // обновляем текст с информацией о страницах
     pageInfo.textContent = `Страница ${currentPage + 1} из ${totalPages}`;

     // если всего одна страница, отключаем обе кнопки
     if (totalPages <= 1) {
         prevButton.disabled = true;
         nextButton.disabled = true;
         return;
     }

     // включаем или отключаем кнопку 'Предыдущая'
     prevButton.disabled = currentPage === 0;

     // включаем или отключаем кнопку 'Следующая'
     nextButton.disabled = currentPage === totalPages - 1;
}

function changePage(direction) {
    let pageInfo = document.getElementById('backlog-page-info');
    let totalPages = parseInt(pageInfo.dataset.totalPages);

    // вычисляем новую страницу
    currentPage += direction;

    // проверяем границы страниц
    if (currentPage < 0) {
        currentPage = 0;
    } else if (currentPage >= totalPages) {
        currentPage = totalPages - 1;
    }

    // загружаем задачи для новой страницы после переключение кнопки
    fetchFilteredTasks();
}

async function fetchFilteredTasks() {
    let token = localStorage.getItem('accessToken');
    let userRole = localStorage.getItem('userRole');

    showLoading('tasks-container-backlog');
    try {
        // получаем выбранные значения
        let status = statusFilter.value === 'Все статусы' ? null : statusFilter.value;
        let priority = priorityFilter.value;

        // преобразуем приоритет в кодовое значение
        if (priority && priority !== 'Все приоритеты') {
            priority = priorityMapping[priority];
        } else {
            priority = null;
        }

        // формируем URL с параметрами фильтрации и пагинации
        let url = `${BACKEND_URL}/api/v1/tasks/filter?page=${currentPage}&size=${pageSize}`;

        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (priority) url += `&priority=${encodeURIComponent(priority)}`;

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
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

        let data = await response.json();

        let tasks = data.tasks; // список задач на текущей странице
        let totalPages = data.totalPages; // общее количество страниц

        let taskContainer = document.getElementById('tasks-container-backlog');

        // очищаем контейнер перед добавлением новых задач
        taskContainer.innerHTML = '';

        // создаем элементы для каждой задачи
        tasks.forEach((task) => {
            let taskElement = createTaskElement(task);
            taskContainer.appendChild(taskElement);
        });

        // обновляем элементы пагинации
        updatePagination(currentPage, totalPages);

        if (userRole !== 'GUEST') {
            initializeTaskCounters();
        }
        initializeSearch();
    } catch (error) {
        console.error('Ошибка при получении задач:', error.message);
        showNotification('Ошибка при получении задач', 'error');
    }
}

// поиск чекбоксов с выбранными задачами и их добавление в спринт
export function saveSelectedTasks() {
    let allCheckboxes = document.querySelectorAll("#backlog-content input[type='checkbox']");
    let taskContainer = document.getElementById('tasks-container-backlog');
    let taskCheckboxes = Array.from(allCheckboxes).filter(
        (checkbox) => checkbox.id !== 'select-all-checkbox'
    );
    let selectedTasks = [];

    taskCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            // извлекаем taskId из id чекбокса
            let taskId = checkbox.id.replace('task-', '');

            // находим родительский элемент задачи
            let taskItem = checkbox.closest('.task-item');

            if (taskItem) {
                let numberLink = taskItem.querySelector("a[href^='https://fmlogistic.simpleone.ru/record/itsm_change_request/']");
                // формируем JSON для задачи
                let task = {
                    id: taskId,
                    status: taskItem.querySelector('#task-status')?.textContent.trim(),
                    number: numberLink?.textContent.trim(),
                    externalId: numberLink?.getAttribute('href').split('/').pop(),
                    author: taskItem.querySelector('#author-related')?.textContent.trim(),
                    client: taskItem.querySelector('#client-related')?.textContent.trim() || 'NO CLIENT',
                    subject: taskItem.querySelector('label').textContent.trim(),
                    responsible: taskItem.querySelector('#user-related')?.textContent.trim(),
                    priority: taskItem.querySelector('.bg-green-100')?.textContent.trim() || 'LOW',
                    storyPoints: 0,
                    plannedStartDateTime: null,
                    plannedEndDateTime: null,
                    comment: null
                };

                selectedTasks.push(task);
            }
        }
    });

    if (selectedTasks.length === 0) {
        showNotification('Нет выбранных задач для сохранения', 'error');
        return;
    }

    addTasksToSprint(selectedTasks);
}

// сохранение добавленных задач в спринт
async function addTasksToSprint(tasks) {
    let currentSprintId = localStorage.getItem('currentSprintId');
    let token = localStorage.getItem('accessToken');
    try {
        let url = new URL(BACKEND_URL + '/api/v1/sprints/' + currentSprintId + '/add/tasks');
        let response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tasks)
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (!response.ok) {
            showNotification('Ошибка при добавлении задач в спринт', 'error');
        }

        let result = await response.json();
        showNotification('Задачи добавлены в текущий спринт', 'success');
    } catch (error) {
        console.error('Ошибка при добавлении задач в спринт:', error);
        showNotification('Ошибка при добавлении задач в спринт', 'error');
    }
}

/*
// функция для отрисовки всех задач (неактуальна, так как запрос на отрисовку выполняется в методе fetchFilteredTasks)
export async function renderTasks() {
    try {
        let url = BACKEND_URL + '/api/v1/tasks?page=' + currentPage + '&size=' + pageSize;
        let response = await fetch(url);
        if (!response.ok) {
            showNotification('Ошибка при получении задач', 'error');
        }

        let data = await response.json();

        let taskContainer = document.getElementById('tasks-container-backlog');
        let totalPages = data.totalPages; // общее количество страниц
        let tasks = data.tasks;

        // очищаем контейнер перед добавлением новых задач
        taskContainer.innerHTML = '';

        // создаем элементы для каждой задачи
        tasks.forEach((task) => {
            let taskElement = createTaskElement(task);
            taskContainer.appendChild(taskElement);
        });

        updatePagination(currentPage, totalPages);
        initializeTaskCounters();
        initializeSearch();
    } catch (error) {
        console.error('Ошибка при получении задач:', error);
        showNotification('Ошибка при получении задач', 'error');
    }
}
*/

// поиск задач (вызывается при загрузке страницы)
function initializeSearch() {
    let searchInput = document.getElementById('search-input');
    let taskContainer = document.getElementById('tasks-container-backlog');

    // обработка нажатия Enter
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            let query = searchInput.value.trim();
            if (query.length > 0) {
                sendSearchRequest(query);
            } else {
                fetchFilteredTasks();
            }
        }
    });
}

// функция для отправки запроса на поиск задач
async function sendSearchRequest(text) {
    let token = localStorage.getItem('accessToken');
    let userRole = localStorage.getItem('userRole');
    try {
        let url = new URL(BACKEND_URL + '/api/v1/tasks/search');
        url.searchParams.append('keyword', text.toLowerCase());

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
            showNotification('Ошибка при поиске задач', 'error');
        }

        let tasks = await response.json();

        let taskContainer = document.getElementById('tasks-container-backlog');
        taskContainer.innerHTML = '';

        tasks.forEach((task) => {
            let taskElement = createTaskElement(task);
            taskContainer.appendChild(taskElement);
        });

        if (userRole !== 'GUEST') {
            initializeTaskCounters();
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        showNotification('Ошибка при поиске задач', 'error');
    }
}

// синхронизация с SimpleOne
async function synchronizeWithSimpleOne() {
    let token = localStorage.getItem('accessToken');
    showLoading('tasks-container-backlog');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/tasks/sync/backlog');
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
            showNotification('Ошибка при синхронизации задач', 'error');
            return;
        }

        let tasks = await response.json();

        let taskContainer = document.getElementById('tasks-container-backlog');

        // очищаем контейнер перед добавлением новых задач
        taskContainer.innerHTML = '';

        // создаем элементы для каждой задачи
        tasks.forEach((task) => {
            let taskElement = createTaskElement(task);
            taskContainer.appendChild(taskElement);
        });

        initializeTaskCounters();
        initializeSearch();
        showNotification('Успешная синхронизация', 'success');
    } catch (error) {
        hideLoadingScreen('backlog-loading-screen');
        console.error('Ошибка при синхронизации задач:', error);
        showNotification('Ошибка при синхронизации задач', 'error');
    }
}

// функция для формирования HTML-разметки задачи
function createTaskElement(task) {
    let userRole = localStorage.getItem('userRole');

    // контейнер задачи
    let taskItem = document.createElement('div');
    taskItem.className =
        'task-item bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-300';

    let checkboxWrapper = null;
    if (userRole !== 'GUEST') {
        // отрисовка чекбокса
        checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'flex items-center h-5';
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task-${task.id}`;
        checkbox.className = 'focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded';
        checkboxWrapper.appendChild(checkbox);
    }

    // основное содержимое задачи
    let contentWrapper = document.createElement('div');
    contentWrapper.className = 'ml-3 flex-1';

    // заголовок задачи
    let headerWrapper = document.createElement('div');
    headerWrapper.className = 'flex justify-between';
    let label = document.createElement('label');
    label.htmlFor = `task-${task.id}`;
    label.className = 'font-medium text-gray-700';
    label.textContent = task.subject;
    headerWrapper.appendChild(label);

    // приоритет задачи
    let priorityBadge = document.createElement('span');
    priorityBadge.className = getPriorityClass(task.priority);
    priorityBadge.textContent = task.priority;
    headerWrapper.appendChild(priorityBadge);

    contentWrapper.appendChild(headerWrapper);

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
    author.id = 'author-related';
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
    responsible.id = 'user-related';
    responsible.className = 'mr-4';
    responsible.textContent = task.responsible || 'Не назначен';
    detailsWrapper.appendChild(responsible);

    // статус задачи
    let chartIcon = document.createElement('img');
    chartIcon.src = '/icons/chart-simple-solid.svg';
    chartIcon.alt = 'Статус';
    chartIcon.className = 'w-3 h-3 mr-1';
    detailsWrapper.appendChild(chartIcon);

    let taskStatus = document.createElement('span');
    taskStatus.id = 'task-status';
    taskStatus.className = 'mr-4';
    taskStatus.textContent = task.status;
    detailsWrapper.appendChild(taskStatus);

    // клиент
    let clientIcon = document.createElement('img');
    clientIcon.src = '/icons/address-book-solid.svg';
    clientIcon.alt = 'Клиент';
    clientIcon.className = 'w-3 h-3 mr-1';
    detailsWrapper.appendChild(clientIcon);

    let client = document.createElement('span');
    client.id = 'client-related';
    client.className = 'mr-4';
    client.textContent = task.client || 'NO CLIENT';
    detailsWrapper.appendChild(client);

    contentWrapper.appendChild(detailsWrapper);

    // все части вместе
    let flexWrapper = document.createElement('div');
    flexWrapper.className = 'flex items-start';

    // добавляем чекбокс только если роль не GUEST
    if (checkboxWrapper) {
        flexWrapper.appendChild(checkboxWrapper);
    }

    flexWrapper.appendChild(contentWrapper);

    taskItem.appendChild(flexWrapper);

    return taskItem;
}

// функция для обновления счетчиков
function updateSelectedCount(taskCheckboxes) {
    let addToSprintBtn = document.getElementById('add-to-sprint');
    let selectedCount = document.getElementById('selected-count');
    let totalCountElement = document.getElementById('total-count');

    if (!addToSprintBtn || !selectedCount || !totalCountElement) {
        console.error('Не удалось найти элементы для обновления счетчиков');
        return;
    }

    let selected = Array.from(taskCheckboxes).filter((checkbox) => checkbox.checked).length;
    let total = taskCheckboxes.length;

    selectedCount.textContent = selected;
    totalCountElement.textContent = total;

    if (selected > 0) {
        addToSprintBtn.disabled = false;
        addToSprintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        addToSprintBtn.disabled = true;
        addToSprintBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// функция для обновления состояния чекбокса 'Выбрать все'
function updateSelectAllCheckbox(taskCheckboxes) {
    let selectAllCheckbox = document.getElementById('select-all-checkbox');

    if (!selectAllCheckbox) {
        console.error("Чекбокс 'Выбрать все' не найден");
        return;
    }

    let allChecked = Array.from(taskCheckboxes).every((checkbox) => checkbox.checked);
    let someChecked = Array.from(taskCheckboxes).some((checkbox) => checkbox.checked);

    if (allChecked) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (someChecked) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}

// счетчики для выбора задач на листе бэклог
export function initializeTaskCounters() {
    let allCheckboxes = document.querySelectorAll("#backlog-content input[type='checkbox']");
    let taskCheckboxes = Array.from(allCheckboxes).filter(
        (checkbox) => checkbox.id !== 'select-all-checkbox'
    );
    let addToSprintBtn = document.getElementById('add-to-sprint');
    let selectedCount = document.getElementById('selected-count');
    let totalCountElement = document.getElementById('total-count');
    let selectAllCheckbox = document.getElementById('select-all-checkbox');

    if (!addToSprintBtn || !selectedCount || !totalCountElement || !selectAllCheckbox) {
        console.error('Не удалось найти необходимые элементы для инициализации счетчиков');
        return;
    }

    // добавляем обработчики событий на каждый чекбокс
    taskCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            updateSelectedCount(taskCheckboxes);
            updateSelectAllCheckbox(taskCheckboxes); // обновляем состояние 'Выбрать все'
        });
    });

    // обработчик для чекбокса 'Выбрать все'
    selectAllCheckbox.addEventListener('change', () => {
        let isChecked = selectAllCheckbox.checked;

        taskCheckboxes.forEach((checkbox) => {
            checkbox.checked = isChecked;
        });

        updateSelectedCount(taskCheckboxes);
        updateSelectAllCheckbox(taskCheckboxes); // обновляем состояние 'Выбрать все'
    });

    // инициализация: обновляем счетчики при загрузке страницы
    updateSelectedCount(taskCheckboxes);
    updateSelectAllCheckbox(taskCheckboxes);
}

// функция для определения класса приоритета
function getPriorityClass(priority) {
    switch (priority) {
        case 'HIGH':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
        case 'MEDIUM':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
        case 'LOW':
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
        default:
            return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
}