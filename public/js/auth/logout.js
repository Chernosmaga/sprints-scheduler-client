import { showNotification } from '../util/notification.js';

const backendUrl = 'http://localhost:8080';
const loginPage = '/account/login';

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    fetch(backendUrl + '/api/auth/logout', {
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