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
            link.classList.add('nav-link'); // Добавляем базовый класс
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
                        navLinkElement.classList.remove('active');
                        navLinkElement.classList.add('nav-link');
                    }
                });

                // показываем выбранный контент
                let selectedContent = document.getElementById(selectedLink.content);
                if (selectedContent) {
                    selectedContent.classList.remove('hidden');
                }

                // добавляем активные стили для выбранной ссылки
                link.classList.remove('nav-link');
                link.classList.add('active');
            });
        }
    });
}

export function setupSidebar() {
    let toggleSidebar = document.getElementById("toggle-sidebar");
    let mainContent = document.getElementById("main-content");

    toggleSidebar.addEventListener("click", () => {
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
                navLinkElement.classList.remove('active');
                navLinkElement.classList.add('nav-link');
            }
        });
        
        if (linkElement) {
            linkElement.classList.remove('nav-link');
            linkElement.classList.add('active');
        }
    } else {
        const defaultLinkId = Object.keys(navLinks)[0];
        const defaultLink = navLinks[defaultLinkId];
        
        document.getElementById(defaultLink.content)?.classList.remove('hidden');
        document.getElementById(defaultLinkId)?.classList.add('active');
    }
}

function createSprintButton() {
    let button = document.createElement('a');
    button.href = '/create/sprint';
    button.id = 'create-sprint-link';
    button.className = 'create-sprint-btn transition-all';

    let icon = document.createElement('img');
    icon.src = '/icons/circle-plus-solid.svg';
    icon.alt = 'Создать спринт';
    icon.className = 'nav-icon';

    let text = document.createElement('span');
    text.id = 'create-sprint-btn';
    text.textContent = 'Создать спринт';

    button.appendChild(icon);
    button.appendChild(text);

    return button;
}