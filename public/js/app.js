import * as Sprint from "../js/sprint.js";
import * as Backlog from "../js/backlog.js";
import * as Settings from "../js/settings.js";
import * as CreateSprint from "../js/create-sprint.js";
import * as History from "../js/history.js";
import * as Sidebar from "../js/sidebar.js";
import * as Team from "../js/team.js";

document.addEventListener("DOMContentLoaded", () => {
    // инициализация страниц
    const pages = {
        currentSprint: document.getElementById("current-sprint-content"),
        backlog: document.getElementById("backlog-content"),
        createSprint: document.getElementById("create-sprint-content"),
        history: document.getElementById("history-content"),
        settings: document.getElementById("settings-content"),
        teamSettings: document.getElementById("team-settings-content"),
    };

    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/account/login';
    }

    let getUserSettingsButton = document.getElementById("user-settings-btn");
    let saveUserDataButton = document.getElementById("user-save-data");
    let getHistoryButton = document.getElementById("history-sprint-btn");
    let getCurrentSprintData = document.getElementById("get-sprint-btn");
    let userRole = localStorage.getItem("userRole");

    Sidebar.setupSidebar();
    Sidebar.setupNavigation(userRole);
    Sprint.loadSprintData();
    Settings.fetchUserData();

    // инициализация страницы на основе текущего URL
    initializePageFromUrl(pages);

    // функция для показа выбранной страницы
    function showPage(pageId) {
        // скрываем все страницы
        Object.values(pages).forEach((page) => page.classList.add("hidden"));

        // показываем выбранную страницу
        let selectedPage = pages[pageId];
        if (selectedPage) {
            selectedPage.classList.remove("hidden");
            // загружаем данные для страницы (если они еще не загружены)
            loadDataForPage(pageId);
        }
    }

    // функция для загрузки данных
    function loadDataForPage(pageId) {
        if (!pages[pageId].dataset.loaded) {
            // помечаем, что данные загружены
            pages[pageId].dataset.loaded = true;

            // вызываем соответствующий модуль для загрузки данных
            if (userRole === "ADMIN") {
                switch (pageId) {
                    case "currentSprint":
                        //Sprint.renderTasksForSprint();
                        Sprint.loadSprintData();
                        break;
                    case "backlog":
                        Backlog.loadBacklogData();
                        break;
                    case "createSprint":
                        CreateSprint.renderTasks();
                        break;
                    case "history":
                        History.renderData();
                        break;
                    case "settings":
                        Settings.fetchUserData();
                        break;
                    case "teamSettings":
                        Team.renderUserList();
                        Team.initializeSearch();
                        Team.renderCreateUserButton();
                        break;
                }
            } else if (userRole === "USER" || userRole === "GUEST") {
                switch (pageId) {
                    case "currentSprint":
                        //Sprint.renderTasksForSprint();
                        Sprint.loadSprintData();
                        break;
                    case "backlog":
                        Backlog.loadBacklogData();
                        break;
                    case "history":
                        History.renderData();
                        break;
                    case "settings":
                        Settings.fetchUserData();
                        break;
                    case "teamSettings":
                        Team.renderUserList();
                        Team.initializeSearch();
                        break;
                }
            }
        }
    }

    if (userRole === "ADMIN") {
        let createSprintButton = document.getElementById("create-sprint-btn");
        let cancelSprintButton = document.getElementById("cancel-button");
        let createSprintSubmitButton = document.getElementById("create-sprint-button");

        document.getElementById("create-sprint-link").addEventListener("click", (e) => {
            e.preventDefault();
            showPage("createSprint");
        });

        // нажатие на кнопку для создания спринта (в меню)
        createSprintButton.addEventListener("click", () => {
            CreateSprint.renderTasks();
        });

        // нажатие на кнопку отмены
        cancelSprintButton.addEventListener("click", () => {
            window.location.href = "/current/sprint";
        });

        // создание спринта и отправка данных на API по нажатию кнопки
        createSprintSubmitButton.addEventListener("click", async () => {
            CreateSprint.sendSprintToCreate();
        });

        document.getElementById("create-sprint-link").addEventListener("click", (e) => {
            e.preventDefault();
            updateUrlAndShowPage("createSprint", "/create/sprint");
        });

        document.getElementById("create-user-button-container").addEventListener("click", (e) => {
            e.preventDefault();
            Team.openCreateUserModal();
        });

        document.getElementById("cancel-modal-btn").addEventListener("click", (e) => {
            e.preventDefault();
            Team.closeCreateUserModal();
        });
    }

    // функция для инициализации страницы на основе URL
    function initializePageFromUrl(pages) {
        let pathToPageId = {
            "/current/sprint": "currentSprint",
            "/backlog": "backlog",
            "/history": "history",
            "/account/settings": "settings",
            "/create/sprint": "createSprint",
            "/team/settings": "teamSettings"
        };

        let currentPath = window.location.pathname;
        let pageId = pathToPageId[currentPath];

        if (pageId) {
            showPage(pageId);
        } else {
            // если путь не найден, показываем страницу по умолчанию
            showPage("currentSprint");
        }
    }

    // функция для обновления URL и показа страницы
    function updateUrlAndShowPage(pageId, path) {
        window.history.pushState({}, "", path);
        showPage(pageId);
    }

    // обработка события popstate (например, нажатие кнопки "Назад" в браузере)
    window.addEventListener("popstate", () => {
        initializePageFromUrl(pages);
    });

    // нажатие на кнопку получения задач на спринт
    getCurrentSprintData.addEventListener("click", () => {
        //Sprint.renderTasksForSprint();
        Sprint.loadSprintData();
    });

    // назначаем обработчики событий для ссылок в меню
    document.getElementById("current-sprint-link").addEventListener("click", (e) => {
        e.preventDefault();
        updateUrlAndShowPage("currentSprint", "/current/sprint");
    });

    document.getElementById("backlog-link").addEventListener("click", (e) => {
        e.preventDefault();
        updateUrlAndShowPage("backlog", "/backlog");
    });

    document.getElementById("history-sprint-link").addEventListener("click", (e) => {
        e.preventDefault();
        updateUrlAndShowPage("history", "/history");
    });

    document.getElementById("settings-link").addEventListener("click", (e) => {
        e.preventDefault();
        updateUrlAndShowPage("settings", "/account/settings");
    });

    document.getElementById("team-settings-link").addEventListener("click", (e) => {
        e.preventDefault();
        updateUrlAndShowPage("teamSettings", "/team/settings");
    });

    getUserSettingsButton.addEventListener("click", () => {
        Settings.fetchUserData();
    });

    saveUserDataButton.addEventListener("click", async () => {
        Settings.sendUserDataToSave();
    });

    // нажатие на кнопку истории спринтов
    getHistoryButton.addEventListener("click", () => {
        History.renderData();
    });
});
