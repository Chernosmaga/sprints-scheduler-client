const BACKEND_URL = window.appConfig.BACKEND_URL;
const loginPage = '/account/login';

// фугкция для обновления токена пользователя
export function refreshToken(response) {
    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    let isRefreshable = localStorage.getItem('isRefreshable');

    if (response.status === 403 || response.status === 401) {
        if (isRefreshable) {
            refreshUserToken(accessToken, refreshToken);
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('isRefreshable');
            localStorage.removeItem('userRole');
            localStorage.removeItem('theme');
            localStorage.removeItem('currentSprintId');
            window.location.href = loginPage;
            return;
        }
    }
}

async function refreshUserToken(userAccessToken, userRefreshToken) {
    let json = {
        refreshToken: userRefreshToken
    };

    try {
        let url = BACKEND_URL + "/api/auth/refresh/token";

        let response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userAccessToken}`
            },
            body: JSON.stringify(json),
        });

        let data = await response.json();

        if (!response.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('isRefreshable');
            localStorage.removeItem('userRole');
            localStorage.removeItem('theme');
            localStorage.removeItem('currentSprintId');
            window.location.href = loginPage;
            return;
        } else {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
        }
    } catch (error) {
        console.error("Ошибка при входе в систему:", error);
        showNotification("Ошибка при входе в систему", "error");
    }
}

// вспомогательная функция для расчета процента выполнения
export function getProgressPercentage(start, end) {
    let today = new Date(); // текущая дата

    // если текущая дата раньше начала спринта, прогресс = 0%
    if (today < start) return 0;

    // если текущая дата позже окончания спринта, прогресс = 100%
    if (today > end) return 100;

    // вычисляем общее количество дней в спринте
    let totalDays = (end - start) / (1000 * 60 * 60 * 24);

    // вычисляем, сколько дней прошло с начала спринта
    let elapsedDays = (today - start) / (1000 * 60 * 60 * 24);

    // рассчитываем процент прогресса
    let progress = (elapsedDays / totalDays) * 100;

    return Math.min(Math.max(progress, 0), 100); // ограничиваем значение от 0 до 100
}

export function parseDate(dateString) {
    let date = new Date(dateString);

    let day = String(date.getDate()).padStart(2, '0'); // день (с ведущим нулём)
    let month = String(date.getMonth() + 1).padStart(2, '0'); // месяц (с ведущим нулём, +1 так как месяцы начинаются с 0)
    let year = date.getFullYear(); // год

    // формируем новую строку в формате dd.MM.yyyy
    return `${day}.${month}.${year}`;
}

// отрисовка кнопок, если пользователь ADMIN или USER
export function createButton(buttonData) {
    // создаем элемент кнопки
    let button = document.createElement('button');
    button.id = buttonData.id;
    button.className = 'primary-button flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2';

    // добавляем иконку
    let img = document.createElement('img');
    img.src = buttonData.icon;
    img.alt = buttonData.alt;
    img.className = 'w-4 h-4 mr-2';
    button.appendChild(img);

    // добавляем текст
    let span = document.createElement('span');
    span.textContent = buttonData.text;
    button.appendChild(span);

    // добавляем обработчик события
    button.addEventListener('click', buttonData.onClick);

    return button;
}

export function initializeLoadMoreButton() {
    const backToTopButton = document.getElementById("back-to-top");
    const mainContainer = document.querySelector('.main-bg');

    const handleScroll = () => {
        const isScrolled = mainContainer.scrollTop > 300;
        backToTopButton.style.display = isScrolled ? "block" : "none";
    };

    mainContainer.addEventListener('scroll', handleScroll, { passive: true });

    backToTopButton.addEventListener("click", (e) => {
        e.preventDefault();
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
    });

    handleScroll();
}