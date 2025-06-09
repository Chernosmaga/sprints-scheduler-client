import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const mainPage = '/current/sprint';

document.getElementById('login-toggle-password').addEventListener('click', function() {
    let eyeIcon = document.getElementById('eye-icon');
    let passwordInput = document.getElementById('login-user-password');

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

// получение данных из формы для входа
document.getElementById('login-sing-in').addEventListener('click', function(e) {
    e.preventDefault();
    let email = document.getElementById('login-user-email');
    let password = document.getElementById('login-user-password');
    let emailError = document.getElementById('login-email-error');
    let passwordError = document.getElementById('login-password-error');
    
    let isValid = true;

    let emailValue = email.value.trim();
    if (!emailValue) {
        email.classList.add('error');
        emailError.classList.remove('hidden');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        email.classList.add('error');
        emailErrorElement.classList.remove('hidden');
        showNotification('Введите корректный email', 'error');
        return;
    } else {
        email.classList.remove('error');
        emailError.classList.add('hidden');
    }

    let passwordValue = password.value.trim();
    if (!passwordValue) {
        password.classList.add('error');
        passwordError.classList.remove('hidden');
        isValid = false;
    } else {
        password.classList.remove('error');
        passwordError.classList.add('hidden');
    }

    if (!isValid) {
        showNotification('Поле обязательно для заполнения', 'error');
        return;
    }

    loginUser(emailValue, passwordValue);
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

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userRole', data.userRole);
        localStorage.setItem('refreshToken', data.refreshToken);
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('isRefreshable', true);
        } else {
            localStorage.setItem('isRefreshable', false);
        }

        window.location.href = mainPage;
    } catch (error) {
        console.error('Ошибка при входе в систему:', error);
        showNotification('Ошибка при входе в систему', 'error');
    }
}