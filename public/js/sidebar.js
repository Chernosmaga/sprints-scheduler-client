const navLinksForAdmin = {
    'current-sprint-link': {
        content: 'current-sprint-content',
        title: 'Текущий спринт',
        path: '/current/sprint'
    },
    'backlog-link': {
        content: 'backlog-content',
        title: 'Бэклог задач',
        path: '/backlog'
    },
    'create-sprint-link': {
        content: 'create-sprint-content',
        title: 'Создать спринт',
        path: '/create/sprint'
    },
    'history-sprint-link': {
        content: 'history-content',
        title: 'История спринтов',
        path: '/history'
    },
    'settings-link': {
        content: 'settings-content',
        title: 'Настройки',
        path: '/account/settings'
    }
};

const navLinksForUser = {
    'current-sprint-link': {
        content: 'current-sprint-content',
        title: 'Текущий спринт',
        path: '/current/sprint'
    },
    'backlog-link': {
        content: 'backlog-content',
        title: 'Бэклог задач',
        path: '/backlog'
    },
    'history-sprint-link': {
        content: 'history-content',
        title: 'История спринтов',
        path: '/history'
    },
    'settings-link': {
        content: 'settings-content',
        title: 'Настройки',
        path: '/account/settings'
    }
};

let navLinks;

// функция для настройки бокового меню
export function setupNavigation(userRole) {
    let createSprintButtonContainer = document.getElementById('create-sprint-button-container');

    if (userRole === 'ADMIN') {
        navLinks = navLinksForAdmin;
        if (createSprintButtonContainer) {
            createSprintButtonContainer.appendChild(createSprintButton());
        }
    } else if (userRole === 'USER' || userRole === 'GUEST') {
        navLinks = navLinksForUser;
    }

    console.log(navLinks);

    Object.keys(navLinks).forEach((linkId) => {
        let link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const selectedLink = navLinks[linkId];

                // обновляем URL
                window.history.pushState({}, '', selectedLink.path);

                // скрываем все контенты страниц
                Object.values(navLinks).forEach((navItem) => {
                    let contentElement = document.getElementById(navItem.content);
                    if (contentElement) {
                        contentElement.classList.add('hidden');
                    }
                });

                // сбрасываем стили всех ссылок
                Object.keys(navLinks).forEach((navLinkId) => {
                    let navLinkElement = document.getElementById(navLinkId);
                    if (navLinkElement) {
                        navLinkElement.classList.remove('bg-indigo-900', 'text-white');
                        navLinkElement.classList.add(
                            'text-indigo-200',
                            'hover:bg-indigo-700',
                            'hover:text-white'
                        );
                    }
                });

                // показываем выбранный контент
                let selectedContent = document.getElementById(selectedLink.content);
                if (selectedContent) {
                    selectedContent.classList.remove('hidden');
                }

                // добавляем активные стили для выбранной ссылки
                link.classList.remove(
                    'text-indigo-200',
                    'hover:bg-indigo-700',
                    'hover:text-white'
                );
                link.classList.add('bg-indigo-900', 'text-white');
            });
        }
    });

    // инициализация при загрузке страницы
    initializePageFromUrl(navLinks);
}

export function setupSidebar() {
    let toggleSidebar = document.getElementById("toggle-sidebar");
    //let sidebar = document.getElementById("sidebar");
    let mainContent = document.getElementById("main-content");
    //let logoText = document.getElementById("logo-text");

    toggleSidebar.addEventListener("click", () => {
        // переключаем классы для меню и основного контента
        //sidebar.classList.toggle("w-14");
        //mainContent.classList.toggle("ml-150");
        mainContent.classList.toggle("ml-200");
    });
}

function initializePageFromUrl(navLinks) {
    const currentPath = window.location.pathname;

    // Находим ссылку, соответствующую текущему пути
    const selectedLink = Object.values(navLinks).find(link => link.path === currentPath);

    if (selectedLink) {
        // Скрываем все контенты страниц
        Object.values(navLinks).forEach((navItem) => {
            let contentElement = document.getElementById(navItem.content);
            if (contentElement) {
                contentElement.classList.add('hidden');
            }
        });

        // Показываем выбранный контент
        let selectedContent = document.getElementById(selectedLink.content);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        // Добавляем активные стили для выбранной ссылки
        const linkElement = document.querySelector(`a[href="${selectedLink.path}"]`);
        if (linkElement) {
            linkElement.classList.remove(
                'text-indigo-200',
                'hover:bg-indigo-700',
                'hover:text-white'
            );
            linkElement.classList.add('bg-indigo-900', 'text-white');
        }
    }
}

function createSprintButton() {
    // создаем элемент <a>
    let button = document.createElement('a');
    button.href = '/create/sprint';
    button.id = 'create-sprint-link';
    button.className = 'flex items-center px-3 py-2 text-sm font-medium rounded-md text-indigo-200 hover:bg-indigo-700 hover:text-white';

    // создаем элемент <img> для иконки
    let icon = document.createElement('img');
    icon.src = '/icons/circle-plus-solid.svg';
    icon.alt = 'Создать спринт';
    icon.className = 'w-5 h-5 mr-3';

    // создаем элемент <span> для текста
    let text = document.createElement('span');
    text.id = 'create-sprint-btn';
    text.textContent = 'Создать спринт';

    // добавляем иконку и текст внутрь кнопки
    button.appendChild(icon);
    button.appendChild(text);

    // возвращаем готовую кнопку
    return button;
}

// функция для настройки вкладок в настройках
export function setupSettingsTabs() {
    let settingsTabs = {
        'account-tab': 'account-settings',
        'team-tab': 'team-settings',
    };

    Object.keys(settingsTabs).forEach((tabId) => {
        let tab = document.getElementById(tabId);
        if (tab) {
            tab.addEventListener('click', () => {
                // скрываем все контенты вкладок
                Object.values(settingsTabs).forEach((contentId) => {
                    let contentElement = document.getElementById(contentId);
                    if (contentElement) {
                        contentElement.classList.add('hidden');
                    }
                });

                // сбрасываем стили всех вкладок
                Object.keys(settingsTabs).forEach((tabId) => {
                    let tabElement = document.getElementById(tabId);
                    if (tabElement) {
                        tabElement.classList.remove('border-indigo-500', 'text-indigo-600');
                        tabElement.classList.add(
                            'border-transparent',
                            'text-gray-500',
                            'hover:text-gray-700',
                            'hover:border-gray-300'
                        );
                    }
                });

                // показываем выбранный контент
                let selectedContent = document.getElementById(settingsTabs[tabId]);
                if (selectedContent) {
                    selectedContent.classList.remove('hidden');
                }

                // добавляем активные стили для выбранной вкладки
                tab.classList.remove(
                    'border-transparent',
                    'text-gray-500',
                    'hover:text-gray-700',
                    'hover:border-gray-300'
                );
                tab.classList.add('border-indigo-500', 'text-indigo-600');
            });
        }
    });
}