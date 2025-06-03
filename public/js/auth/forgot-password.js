import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-theme");
    }
});

document.querySelector('form').addEventListener('reset-password-button', function (e) {
    e.preventDefault();
    let email = document.getElementById('user-email').value;
    let emailSentMessage = document.getElementById("email-sent-message");
    let resetPasswordText = document.getElementById("reset-password-text");

    sendResetPasswordLink(email);

    emailFieldContainer.classList.add("hidden");
    emailSentMessage.classList.remove("hidden");
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