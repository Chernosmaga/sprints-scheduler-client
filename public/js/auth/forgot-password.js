import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;

document.getElementById('reset-password-button').addEventListener('click', function (e) {
    e.preventDefault();

    let email = document.getElementById('user-email');
    let resetPasswordText = document.getElementById('reset-password-text');
    let emailFieldContainer = document.getElementById('email-field-container');
    let emailErrorElement = document.getElementById('reset-password-email-error');
    let emailValue = email.value.trim();

    if (!emailValue) {
        email.classList.add('error');
        emailErrorElement.classList.remove('hidden');
        showNotification('Поле обязательно для заполнения', 'error');
        return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        email.classList.add('error');
        emailErrorElement.classList.remove('hidden');
        showNotification('Введите корректный email', 'error');
        return;
    } else {
        email.classList.remove('error');
        emailErrorElement.classList.add('hidden');
        sendResetPasswordLink(email);
    }

    emailFieldContainer.classList.add("hidden");
    resetPasswordText.textContent = "Отправить письмо повторно";

    showNotification('Ссылка для восстановления отправлена на почту', 'success');
});

async function sendResetPasswordLink(email) {
    try {
        let url = new URL(BACKEND_URL + '/reset/password/request');
        url.searchParams.append("email", email);

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        let data = await response.json();

        if (response.status === 401 && data.message.includes("Account is inactive")) {
            showNotification('Ваш аккаунт деактивирован, обратитесь в отдел разработки', 'error');
            return;
        } else if (!response.ok) {
            showNotification('Ошибка на стороне сервера', 'error');
            return;
        }
    } catch (error) {
        console.error('Ошибка на стороне сервера:', error);
        showNotification('Ошибка на стороне сервера', 'error');
    }
}