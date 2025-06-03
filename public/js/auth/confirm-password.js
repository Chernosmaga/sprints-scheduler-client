import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const redirectLocation = '/account/login';

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme");
    }
});

document.getElementById('save-new-password').addEventListener('click', function (e) {
    e.preventDefault();
    let password = document.getElementById('new-user-password');
    let passwordErrorElement = document.getElementById('password-error');
    let urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');

    let togglePasswordButton = document.getElementById('toggle-new-password');
    let eyeIcon = document.getElementById('eye-icon');

    // обработчик клика на кнопку
    togglePasswordButton.addEventListener('click', function () {
        if (passwordInput.type === 'password') {
            // показать пароль
            passwordInput.type = 'text';
            eyeIcon.src = '/icons/eye-slash-solid.svg';
        } else {
            // скрыть пароль
            passwordInput.type = 'password';
            eyeIcon.src = '/icons/eye-solid.svg';
        }
    });

    if (!password.value.trim()) {
        password.classList.add('error');
        passwordErrorElement.classList.remove('hidden');
        showNotification('Поле обязательно для заполнения', 'error');
    } else {
        password.classList.remove('error');
        passwordErrorElement.classList.add('hidden');
        changeUserPassword(password.value, token);
    }
});

async function changeUserPassword(password, token) {
    try {
        let url = new URL(BACKEND_URL + '/reset/password/confirm');
        url.searchParams.append('token', token);
        url.searchParams.append('newPassword', password);

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            showNotification('Ошибка при сохранении данных', 'error');
        } else {
            window.location.href = redirectLocation;
        }
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        showNotification('Ошибка при сохранении данных', 'error');
    }
}