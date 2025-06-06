import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
let canSendAgain = true;

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
    if (!canSendAgain) return;

    const button = document.getElementById('reset-password-button');
    const textElement = document.getElementById('reset-password-text');

    button.disabled = true;
    textElement.textContent = "Повторная отправка доступна через 60 сек";

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

        canSendAgain = false;

        let timeLeft = 60;
        textElement.textContent = `Повторная отправка через ${timeLeft} сек`;

        const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                textElement.textContent = `Повторная отправка через ${timeLeft} сек`;
            } else {
                clearInterval(interval);
                button.disabled = false;
                textElement.textContent = "Отправить письмо повторно";
                canSendAgain = true;
            }
        }, 1000);

    } catch (error) {
        console.error('Ошибка на стороне сервера:', error);
        showNotification('Ошибка на стороне сервера', 'error');

        button.disabled = false;
        textElement.textContent = "Отправить письмо повторно";
    }
}