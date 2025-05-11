import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const redirectLocation = '/account/create/confirm';

document.addEventListener('DOMContentLoaded', function () {
    // предзаполняем поля формы
    document.getElementById('create-account-user-name').value = localStorage.getItem('userName');
    document.getElementById('create-account-user-birthday').value = localStorage.getItem('userBirthday');
    document.getElementById('create-account-user-email').value = localStorage.getItem('userEmail');

    localStorage.removeItem('userName');
    localStorage.removeItem('userBirthday');
    localStorage.removeItem('userEmail');

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
    let group = localStorage.getItem('userGroup');
    let groupId = localStorage.getItem('userGroupId');

    checkInputFields(name, birthday, email, password);
    createUserAccount(name.value, birthday.value, email.value, password.value, group, groupId);
    
    localStorage.removeItem('userGroup');
    localStorage.removeItem('userGroupId');
});

async function createUserAccount(userName, userBirthday, userEmail, userPassword, userGroup, userGroupId) {
    let userJSON = {
        name: userName,
        birthday: userBirthday,
        email: userEmail,
        password: userPassword,
        group: userGroup,
        groupId: userGroupId
    };

    try {
        let url = BACKEND_URL + '/api/auth/register';

        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userJSON)
        });

        console.log(response.json);

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