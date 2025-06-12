import { showNotification } from '../util/notification.js';

let baseUrl = window.location.origin;
const loginPage = '/account/login';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('logout-btn').addEventListener('click', function (event) {
        event.preventDefault();
        fetch(`${baseUrl}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        }).then(response => {
            if (response.ok) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('isRefreshable');
                localStorage.removeItem('userRole');
                localStorage.removeItem('theme');
                localStorage.removeItem('currentSprintId');
                window.location.href = loginPage;
            } else {
                showNotification('Ошибка при выходе из аккаунта', 'error');
            }
        });
    });
});