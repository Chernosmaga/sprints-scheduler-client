import { showNotification } from '/js/util/notification.js';

const backendUrl = 'http://localhost:8080';
const redirectLocation = '/current/sprint';

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
        var url = backendUrl + '/api/v1/users/get/data?email=' + email;
        var response = await fetch(url);
        if (!response.ok) {
            showNotification('Ошибка при получении данных', 'error');
        }

        var user = await response.json();

        localStorage.setItem('user-name', user.name);
        localStorage.setItem('user-birthday', user.birthday);
        localStorage.setItem('user-email', user.email);

        window.location.href = redirectLocation;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        showNotification('Ошибка при получении данных', 'error');
    }
}