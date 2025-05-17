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
    },
    'team-settings-link': {
        content: 'team-settings-content',
        title: 'Команда',
        path: '/team/settings'
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
    },
    'team-settings-link': {
        content: 'team-settings-content',
        title: 'Команда',
        path: '/team/settings'
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

    initializePageFromUrl(navLinks);

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
}

export function setupSidebar() {
    let toggleSidebar = document.getElementById("toggle-sidebar");
    let mainContent = document.getElementById("main-content");

    toggleSidebar.addEventListener("click", () => {
        // переключаем классы для меню и основного контента
        //sidebar.classList.toggle("w-14");
        //mainContent.classList.toggle("ml-150");
        mainContent.classList.toggle("ml-200");
    });
}

function initializePageFromUrl(navLinks) {
    const currentPath = window.location.pathname;
    
    const activeLink = Object.entries(navLinks).find(([_, link]) => 
        link.path === currentPath
    );
    
    if (activeLink) {
        const [linkId, linkData] = activeLink;
        const linkElement = document.getElementById(linkId);
        
        Object.values(navLinks).forEach((navItem) => {
            const contentElement = document.getElementById(navItem.content);
            if (contentElement) contentElement.classList.add('hidden');
        });
        
        const selectedContent = document.getElementById(linkData.content);
        if (selectedContent) selectedContent.classList.remove('hidden');
        
        Object.keys(navLinks).forEach((navLinkId) => {
            const navLinkElement = document.getElementById(navLinkId);
            if (navLinkElement) {
                navLinkElement.classList.remove('bg-indigo-900', 'text-white');
                navLinkElement.classList.add(
                    'text-indigo-200',
                    'hover:bg-indigo-700',
                    'hover:text-white'
                );
            }
        });
        
        if (linkElement) {
            linkElement.classList.remove(
                'text-indigo-200',
                'hover:bg-indigo-700',
                'hover:text-white'
            );
            linkElement.classList.add('bg-indigo-900', 'text-white');
        }
    } else {
        const defaultLinkId = Object.keys(navLinks)[0];
        const defaultLink = navLinks[defaultLinkId];
        
        document.getElementById(defaultLink.content)?.classList.remove('hidden');
        document.getElementById(defaultLinkId)?.classList.add('bg-indigo-900', 'text-white');
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
    icon.className = 'w-4 h-4 mr-3';

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