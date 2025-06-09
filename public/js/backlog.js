import { showNotification } from '../js/util/notification.js';
import { createButton, refreshToken } from '../js/util/util.js';
import { showFirstLoadingBacklogTasks, showLoadingBacklogTasks, hideLoadingBacklogTasks } from '../js/util/loading-screen.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const SIMPLE_ONE_URL = window.appConfig.SIMPLE_ONE_URL;
const loginPage = '/accout/login';
let statusFilter;
let priorityFilter;
let totalTasksCount;
let selectedTasksCount;
let currentSearchQuery = null;
let totalPages = 0;
let loadedPages = 0;
const pageSize = 10;

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
};

const addToSprint = {
    id: 'add-to-sprint',
    icon: '/icons/plus-solid.svg',
    alt: 'Добавить в спринт',
    text: 'Добавить в спринт',
};

const loadMoreTasks = {
    id: 'load-more-tasks-button',
    icon: '/icons/plus-solid.svg',
    alt: 'Загрузить ещё',
    text: 'Загрузить ещё',
};

export function loadBacklogData() {
    let userRole = localStorage.getItem('userRole');
    let addToSprintButtonContainer = document.getElementById('add-to-sprint-button-container');
    let updateBacklogButtonContainer = document.getElementById('update-backlog-button-container');
    let loadMoreTasksContainer = document.getElementById("load-more-tasks-button-container");
    // инициализация фильтров
    statusFilter = document.getElementById('backlog-status-filter');
    priorityFilter = document.getElementById('backlog-priority-filter');

    if (userRole === 'ADMIN' || userRole === 'USER') {
        renderCheckboxSelectAll();
    }

    // отрисовка задач при первом запросе
    fetchFilteredTasks();

    // добавляем обработчики событий для фильтров
    statusFilter.addEventListener('change', filterTasks);
    priorityFilter.addEventListener('change', filterTasks);

    addToSprintButtonContainer.innerHTML = '';
    updateBacklogButtonContainer.innerHTML = '';

    loadMoreTasksContainer.appendChild(createButton(loadMoreTasks));
    
    // функция для подгрузки следующей порции задач
    document.getElementById('load-more-tasks-button').addEventListener('click', () => {
        loadMoreTasksForPage();
    });

    if (userRole === 'ADMIN' || userRole === 'USER') {
        // отрисовываем кнопки
        addToSprintButtonContainer.appendChild(createButton(addToSprint));
        updateBacklogButtonContainer.appendChild(createButton(updateBacklog));

        // нажатие на кнопку обновления статусов
        document.getElementById('update-backlog-btn').addEventListener('click', () => {
            synchronizeWithSimpleOne();
        });

        document.getElementById('add-to-sprint').addEventListener('click', () => {
            saveSelectedTasks();
        });
    }
}

function loadMoreTasksForPage() {
    loadedPages++;
    fetchFilteredTasks();
}

function renderCheckboxSelectAll() {
    let selectAllContainer = document.getElementById('select-all-container');

    // создаем чекбокс "Выбрать все"
    let checkboxWrapper = document.createElement('label');
    checkboxWrapper.className = 'flex items-center cursor-pointer';

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'select-all-checkbox';
    checkbox.className = 'task-checkbox h-4 w-4';

    let label = document.createElement('span');
    label.textContent = 'Выбрать все';
    label.className = 'ml-2 text-gray-400 text-sm';

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);

    // добавляем чекбокс в контейнер
    selectAllContainer.appendChild(checkboxWrapper);
}

export function filterTasks(reset = true) {
    if (reset) {
        currentSearchQuery = null;
        resetTasks();
    }
    fetchFilteredTasks();
}

function resetTasks() {
    loadedPages = 0;

    // обнуляем счётчики
    totalTasksCount = 0;
    selectedTasksCount = 0;

    // очищаем DOM задач
    let tasksContainer = document.getElementById('tasks-container-backlog');
    tasksContainer.innerHTML = '';

    // обнуляем счётчики в интерфейсе
    document.getElementById('total-count').textContent = '0';
    document.getElementById('selected-count').textContent = '0';

    // показываем кнопку "Загрузить ещё"
    let loadMoreButton = document.getElementById('load-more-tasks-button');
    if (loadMoreButton) {
        loadMoreButton.disabled = false;
        loadMoreButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// обновление счётчиков для всех видимых задач
function updateCounters() {
    let allTasks = document.querySelectorAll('#tasks-container-backlog .task-item');
    let selectedTasks = document.querySelectorAll("#tasks-container-backlog .task-item input[type='checkbox']:checked");

    totalTasksCount = allTasks.length;
    selectedTasksCount = selectedTasks.length;

    document.getElementById('total-count').textContent = totalTasksCount;
    document.getElementById('selected-count').textContent = selectedTasksCount;
}

async function fetchFilteredTasks() {
    let token = localStorage.getItem('accessToken');
    let userRole = localStorage.getItem('userRole');

    if (loadedPages === 0) {
        showFirstLoadingBacklogTasks();
    } else {
        showLoadingBacklogTasks();
    }

    try {
        let url;

        if (currentSearchQuery) {
            url = `${BACKEND_URL}/api/v1/tasks/search?keyword=${encodeURIComponent(currentSearchQuery.toLowerCase())}&offset=${loadedPages * pageSize}&size=${pageSize}`;
        } else {
            let status = statusFilter.value === 'Все статусы' ? null : statusFilter.value;
            let priority = priorityFilter.value;

            if (priority && priority !== 'Все приоритеты') {
                priority = priorityMapping[priority];
            } else {
                priority = null;
            }

            url = `${BACKEND_URL}/api/v1/tasks/filter?size=${pageSize}&offset=${loadedPages * pageSize}`;
            if (status) url += `&status=${encodeURIComponent(status)}`;
            if (priority) url += `&priority=${encodeURIComponent(priority)}`;
        }

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        refreshToken(response);

        if (!response.ok) {
            showNotification('Ошибка при получении задач', 'error');
            return;
        }

        let data = await response.json();
        let tasks = data.tasks || data;
        let totalTasks = data.totalElements || data.length;

        totalPages = Math.ceil(totalTasks / pageSize);

        let taskContainer = document.getElementById('tasks-container-backlog');

        if (loadedPages === 0) {
            taskContainer.innerHTML = '';
        } else {
            hideLoadingBacklogTasks();
        }

        tasks.forEach((task) => {
            let taskElement = createTaskElement(task);
            taskContainer.appendChild(taskElement);
        });

        updateCounters();

        if (loadedPages >= totalPages - 1) {
            let loadMoreButton = document.getElementById('load-more-tasks-button');
            if (loadMoreButton) {
                loadMoreButton.disabled = true;
                loadMoreButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            let loadMoreButton = document.getElementById('load-more-tasks-button');
            if (loadMoreButton) {
                loadMoreButton.disabled = false;
                loadMoreButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }

        if (userRole !== 'GUEST') {
            initializeTaskCounters();
        }
        initializeSearch();

    } catch (error) {
        console.error('Ошибка при получении задач:', error.message);
        showNotification('Ошибка при получении задач', 'error');
        if (loadedPages !== 0) {
            hideLoadingBacklogTasks();
        }
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

        refreshToken(response);

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

// поиск задач (вызывается при загрузке страницы)
function initializeSearch() {
    let searchInput = document.getElementById('search-input');
    let taskContainer = document.getElementById('tasks-container-backlog');
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            let query = searchInput.value.trim();
            if (query.length > 0) {
                sendSearchRequest(query);
            } else {
                currentSearchQuery = null;
                loadedPages = 0;

                if (taskContainer) {
                    taskContainer.innerHTML = '';
                }

                let loadMoreButton = document.getElementById('load-more-tasks-button');
                    if (loadMoreButton) {
                        loadMoreButton.disabled = false;
                        loadMoreButton.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                fetchFilteredTasks();
            }
        }
    });
}

// функция для отправки запроса на поиск задач
async function sendSearchRequest(text) {
    currentSearchQuery = text.trim();
    let token = localStorage.getItem('accessToken');
    let userRole = localStorage.getItem('userRole');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/tasks/search');
        url.searchParams.append('keyword', currentSearchQuery.toLowerCase());

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        refreshToken(response);

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
    let updateStatusesButton = document.getElementById('update-backlog-btn');

    updateStatusesButton.disabled = true;
    updateStatusesButton.classList.add('opacity-50', 'cursor-not-allowed');
    showFirstLoadingBacklogTasks();

    try {
        let url = new URL(BACKEND_URL + '/api/v1/tasks/sync/backlog');
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        refreshToken(response);

        if (!response.ok) {
            showNotification('Ошибка при синхронизации задач', 'error');
            return;
        }

        let tasks = await response.json();
        let taskContainer = document.getElementById('tasks-container-backlog');
        taskContainer.innerHTML = '';
        currentSearchQuery = null;

        tasks.forEach((task) => {
            let taskElement = createTaskElement(task);
            taskContainer.appendChild(taskElement);
        });

        initializeTaskCounters();
        initializeSearch();
        showNotification('Успешная синхронизация', 'success');
        updateStatusesButton.disabled = false;
        updateStatusesButton.classList.remove('opacity-50', 'cursor-not-allowed');

    } catch (error) {
        console.error('Ошибка при синхронизации задач:', error);
        showNotification('Ошибка при синхронизации задач', 'error');
    }
}

// функция для формирования HTML-разметки задачи
function createTaskElement(task) {
    let userRole = localStorage.getItem('userRole');

    // контейнер задачи
    let taskItem = document.createElement('div');
    taskItem.className = 'task-item p-4 rounded-lg transition-all duration-300';

    if (document.body.classList.contains('dark-theme')) {
        taskItem.classList.add('dark-mode');
    }

    let checkboxWrapper = null;
    if (userRole !== 'GUEST') {
        // отрисовка чекбокса
        checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task-${task.id}`;
        checkbox.className = 'task-checkbox';
        checkboxWrapper.appendChild(checkbox);
    }

    // основное содержимое задачи
    let contentWrapper = document.createElement('div');
    contentWrapper.className = 'task-content';

    // заголовок задачи
    let headerWrapper = document.createElement('div');
    headerWrapper.className = 'task-header';
    let label = document.createElement('label');
    label.htmlFor = `task-${task.id}`;
    label.className = 'task-title';
    label.textContent = task.subject;
    headerWrapper.appendChild(label);

    // приоритет задачи
    let priorityBadge = document.createElement('span');
    priorityBadge.className = getPriorityClass(task.priority);

    if (document.body.classList.contains('dark-theme')) {
        priorityBadge.classList.add('dark');
    }

    priorityBadge.textContent = task.priority;
    headerWrapper.appendChild(priorityBadge);

    contentWrapper.appendChild(headerWrapper);

    // дополнительная информация
    let detailsWrapper = document.createElement('div');
    detailsWrapper.className = 'task-details';

    // номер задачи
    let taskNumber = document.createElement('a');
    taskNumber.className = 'task-link';
    taskNumber.href = SIMPLE_ONE_URL + task.externalId;
    taskNumber.target = '_blank';
    taskNumber.rel = 'noopener noreferrer';
    taskNumber.textContent = task.number;
    detailsWrapper.appendChild(taskNumber);

    // добавляем иконки и текстовые элементы с новыми классами
    let addDetail = (iconSrc, altText, text, additionalClass = '') => {
        let icon = document.createElement('img');
        icon.src = iconSrc;
        icon.alt = altText;
        icon.className = 'detail-icon';
        detailsWrapper.appendChild(icon);

        let span = document.createElement('span');
        span.className = `detail-text ${additionalClass}`;
        span.textContent = text || 'Не указано';
        detailsWrapper.appendChild(span);
    };

    // заявитель
    addDetail('/icons/user-tag-solid.svg', 'Заявитель', task.author, 'mr-4');

    // исполнитель
    addDetail('/icons/circle-user-solid.svg', 'Исполнитель', task.responsible, 'mr-4');

    // статус задачи
    addDetail('/icons/chart-simple-solid.svg', 'Статус', task.status, 'mr-4');

    // клиент
    addDetail('/icons/address-book-solid.svg', 'Клиент', task.client, 'mr-4');

    contentWrapper.appendChild(detailsWrapper);

    // все части вместе
    let flexWrapper = document.createElement('div');
    flexWrapper.className = 'task-flex-wrapper';

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
            return 'priority-high inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'MEDIUM':
            return 'priority-medium inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        case 'LOW':
            return 'priority-low inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
        default:
            return 'priority-low inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
    }
}