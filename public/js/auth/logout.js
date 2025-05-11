import { showNotification } from '../util/notification.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
const loginPage = '/account/login';

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    fetch(BACKEND_URL + '/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // если используются куки
    }).then(response => {
        if (response.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('currentSprintId');
            window.location.href = loginPage;
        } else {
            showNotification('Ошибка при выходе из аккаунта', 'error');
        }
    });
});