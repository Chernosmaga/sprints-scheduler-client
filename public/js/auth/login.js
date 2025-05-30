import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const mainPage = '/current/sprint';

// получение данных из формы для входа
document.getElementById('login-sing-in').addEventListener('click', function (e) {
    e.preventDefault();
    let isError = false;
    let email = document.getElementById('login-user-email');
    let password = document.getElementById('login-user-password');
    let emailErrorElement = document.getElementById('login-email-error');
    let passwordErrorElement = document.getElementById('login-password-error');

    if (!email.value.trim()) {
        email.classList.add('error');
        emailErrorElement.classList.remove('hidden');
        isError = true;
    } else {
        email.classList.remove('error');
        emailErrorElement.classList.add('hidden');
    }

    if (!password.value.trim()) {
        password.classList.add('error');
        passwordErrorElement.classList.remove('hidden');
        isError = true;
    } else {
        password.classList.remove('error');
        passwordErrorElement.classList.add('hidden');
    }

    if (isError === true) {
        showNotification('Поле обязательно для заполнения', 'error');
        return;
    }

    loginUser(email.value, password.value);
});

async function loginUser(userEmail, userPassword) {
    // донастроить после создания эндпоинта для рефреша токена
    let rememberMeCheckbox = document.getElementById('remember-me');
    let userJSON = {
        email: userEmail,
        password: userPassword
    };

    try {
        let url = BACKEND_URL + '/api/auth/login';

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