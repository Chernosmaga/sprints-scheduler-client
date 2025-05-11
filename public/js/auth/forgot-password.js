import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;

document.querySelector('form').addEventListener('reset-password-button', function (e) {
    e.preventDefault();
    let email = document.getElementById('user-email').value;
    let emailSentMessage = document.getElementById("email-sent-message");
    let resetPasswordText = document.getElementById("reset-password-text");

    sendResetPasswordLink(email);

    emailFieldContainer.classList.add("hidden");
    emailSentMessage.classList.remove("hidden");
    resetPasswordText.textContent = "Отправить письмо повторно";

    showNotification('Письмо отправлено на почту', 'success');
});

async function sendResetPasswordLink(email) {
    try {
        let url = new URL(BACKEND_URL + '/reset/password/request');

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userJSON)
        });
        
        let data = await response.json();

        if (response.status === 401 && data.message.includes("Account is inactive")) {
            showNotification('Ваш аккаунт деактивирован, обратитесь в отдел разработки', 'error');
            return;
        } else if (!response.ok) {
            showNotification('Ошибка при входе в аккаунт', 'error');
            return;
        }

        let role = data.userRole;
        let token = data.accessToken;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userRole', role);

        window.location.href = mainPage;
    } catch (error) {
        console.error('Ошибка при входе в систему:', error);
        showNotification('Ошибка при входе в систему', 'error');
    }
}