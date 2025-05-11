import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const redirectLocation = '/account/create';

// получение email из формы для загрузки данных из SimpleOne
document.getElementById('registry-sign-up').addEventListener('click', function (e) {
    e.preventDefault();
    let email = document.getElementById('registry-user-email');
    let errorElement = document.getElementById('email-error');

    if (!email.value.trim()) {
        email.classList.add('error');
        errorElement.classList.remove('hidden');
        showNotification('Поле обязательно для заполнения', 'error');
    } else {
        email.classList.remove('error');
        errorElement.classList.add('hidden');
        getUserDataFromExternalService(email.value);
    }
});

async function getUserDataFromExternalService(email) {
    try {
        var url = BACKEND_URL + '/api/v1/users/get/data?email=' + email;
        var response = await fetch(url);
        if (!response.ok) {
            showNotification('Ошибка при получении данных', 'error');
        }

        var user = await response.json();

        localStorage.setItem('userName', user.name);
        localStorage.setItem('userBirthday', user.birthday);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userGroup', user.group);
        localStorage.setItem('userGroupId', user.groupId);

        window.location.href = redirectLocation;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        showNotification('Ошибка при получении данных', 'error');
    }
}