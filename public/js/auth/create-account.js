import { showNotification } from '../util/notification.js';

const backendUrl = 'http://localhost:8080';
const redirectLocation = '/account/login';

document.addEventListener('DOMContentLoaded', function () {
    // предзаполняем поля формы
    document.getElementById('create-account-user-name').value = localStorage.getItem('user-name');
    document.getElementById('create-account-user-birthday').value = localStorage.getItem('user-birthday');
    document.getElementById('create-account-user-email').value = localStorage.getItem('user-email');

    localStorage.removeItem('user-name');
    localStorage.removeItem('user-birthday');
    localStorage.removeItem('user-email');

    let passwordInput = document.getElementById('create-account-user-password');
    let togglePasswordButton = document.getElementById('create-account-toggle-password');
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
});

document.getElementById('create-account-sign-up').addEventListener('click', function (e) {
    e.preventDefault();
    let name = document.getElementById('create-account-user-name');
    let birthday = document.getElementById('create-account-user-birthday');
    let email = document.getElementById('create-account-user-email');
    let password = document.getElementById('create-account-user-password');

    checkInputFields(name, birthday, email, password);
    createUserAccount(name, birthday, email, password);
});

async function createUserAccount(userName, userBirthday, userEmail, userPassword) {
    let userJSON = {
        name: userName,
        birthday: userBirthday,
        email: userEmail,
        password: userPassword
    };

    try {
        let url = backendUrl + '/api/auth/register';

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userJSON)
        });

        if (!response.ok) {
            showNotification('Ошибка при сохранении данных', 'error');
        }

        var user = await response.json();

        window.location.href = redirectLocation;
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        showNotification('Ошибка при сохранении данных', 'error');
    }
}

function checkInputFields(name, birthday, email, password) {
    let isError = false;
    let nameErrorElement = document.getElementById('name-error');
    let birthdayErrorElement = document.getElementById('birthday-error');
    let emailErrorElement = document.getElementById('email-error');
    let passwordErrorElement = document.getElementById('password-error');

    if (!name.value.trim()) {
        name.classList.add('error');
        nameErrorElement.classList.remove('hidden');
        isError = true;
    } else {
        name.classList.remove('error');
        nameErrorElement.classList.add('hidden');
    }

    if (!birthday.value.trim()) {
        birthday.classList.add('error');
        birthdayErrorElement.classList.remove('hidden');
        isError = true;
    } else {
        birthday.classList.remove('error');
        birthdayErrorElement.classList.add('hidden');
    }

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
    }
}