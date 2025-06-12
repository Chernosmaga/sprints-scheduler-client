import { showNotification } from '../util/notification.js';

let baseUrl = window.location.origin;
const redirectLocation = '/account/login';

document.getElementById('toggle-set-password').addEventListener('click', function() {
    let eyeIcon = document.getElementById('eye-icon');
    let passwordInput = document.getElementById('set-user-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.src = '/icons/eye-slash-solid.svg';
        eyeIcon.alt = 'Скрыть пароль';
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = '/icons/eye-solid.svg';
        eyeIcon.alt = 'Показать пароль';
    }
});

document.getElementById('set-password').addEventListener('click', function (e) {
    e.preventDefault();
    let password = document.getElementById('set-user-password');
    let passwordErrorElement = document.getElementById('set-password-error');
    let urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');

    if (!password.value.trim()) {
        password.classList.add('error');
        passwordErrorElement.classList.remove('hidden');
        showNotification('Поле обязательно для заполнения', 'error');
        return;
    } else if (password.value.length < 8) {
        password.classList.add('error'); 
        passwordErrorElement.classList.remove('hidden');
        showNotification('Пароль должен содержать больше 8 символов', 'error');
        return;
    } else {
        password.classList.remove('error');
        passwordErrorElement.classList.add('hidden');
        changeUserPassword(password.value, token);
    }
});

async function changeUserPassword(password, token) {
    try {
        let url = new URL(`${baseUrl}/api/auth/verify/invitation`);
        url.searchParams.append('token', token);
        url.searchParams.append('password', password);

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