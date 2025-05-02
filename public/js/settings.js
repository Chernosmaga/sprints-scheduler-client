import { showNotification } from '../js/util/notification.js';
import { parseDate } from '../js/util/util.js';
const backendUrl = 'http://localhost:8080';
const loginPage = '/account/login';

// поиск пользователей (вызывается при загрузке страницы)
export function initializeSearch() {
    let searchInput = document.getElementById('user-search-input');
    let userContainer = document.getElementById('user-list');

    // обработка нажатия Enter
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            let query = searchInput.value.trim();
            if (query.length > 0) {
                sendSearchRequest(query);
            } else {
                renderUserList();
            }
        }
    });
}

// функция для отправки запроса на поиск пользователей
async function sendSearchRequest(text) {
    let token = localStorage.getItem('accessToken');
    try {
        let url = new URL(backendUrl + '/api/v1/users/search');
        url.searchParams.append('filter', text.toLowerCase());

        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }
        
        if (!response.ok) {
            showNotification('Ошибка при поиске пользователей', 'error');
            return;
        }

        let users = await response.json();

        let userContainer = document.getElementById('user-list');
        userContainer.innerHTML = '';

        users.forEach((user) => {
            let userElement = createUserElement(user);
            userContainer.appendChild(userElement);
        });
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        showNotification('Ошибка при поиске пользователей', 'error');
    }
}

export async function renderUserList() {
    let userListContainer = document.getElementById('user-list');
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(backendUrl + '/api/v1/users');
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let data = await response.json();
        
        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (!response.ok) {
            showNotification('Ошибка при получении данных', 'error');
        }

        if (!userListContainer) {
            console.error('User list container not found!');
            return;
        }

        userListContainer.innerHTML = '';

        data.forEach((user) => {
            let userElement = createUserElement(user);
            userListContainer.appendChild(userElement);
        });

    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        showNotification('Ошибка при получении данных', 'error');
    }
}

function createUserElement(user) {
    let userRole = localStorage.getItem("userRole"); // роль текущего пользователя
    let userContainer = document.createElement('div');
    userContainer.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4';

    // создаем блок с фото и информацией
    let userInfoContainer = document.createElement('div');
    userInfoContainer.className = 'flex items-center';

    // фото
    let photoElement = document.createElement('img');
    photoElement.className = 'h-10 w-10 rounded-full';
    photoElement.src = user.photo?.fileUrl || '/icons/circle-user-solid.svg'; // запасное изображение
    photoElement.alt = user.name || 'photo';

    // информация о пользователе
    let infoContainer = document.createElement('div');
    infoContainer.className = 'ml-4';

    let nameElement = document.createElement('p');
    nameElement.className = 'text-sm font-medium text-gray-900';
    nameElement.textContent = user.name || 'Не указано';

    let emailElement = document.createElement('p');
    emailElement.className = 'text-sm text-gray-500';
    emailElement.textContent = user.email || 'Не указан';

    infoContainer.appendChild(nameElement);
    infoContainer.appendChild(emailElement);

    userInfoContainer.appendChild(photoElement);
    userInfoContainer.appendChild(infoContainer);

    // дата рождения
    //let birthdayElement = document.createElement('span');
    //birthdayElement.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
    //birthdayElement.textContent = parseDate(user.birthday) || 'Не указана';

    // отображение роли
    let roleElement;

    if (userRole === 'ADMIN') {
        // выпадающий список для администратора
        roleElement = document.createElement('select');
        roleElement.className = 'ml-2 px-2 py-1 border border-gray-300 rounded-md text-xs font-medium focus:outline-none focus:ring-indigo-500 focus:border-indigo-500';

        // опции для ролей
        let roles = [
            { value: 'ADMIN', label: 'Администратор' },
            { value: 'USER', label: 'Пользователь' },
            { value: 'GUEST', label: 'Гость' },
        ];

        roles.forEach((role) => {
            let option = document.createElement('option');
            option.value = role.value;
            option.textContent = role.label;
            if (role.value === user.role) {
                option.selected = true; // устанавливаем текущую роль как выбранную
            }
            roleElement.appendChild(option);
        });

        // обработчик изменения роли
        roleElement.addEventListener('change', async (event) => {
            let newRole = event.target.value;

            let userJSON = {
                id: user.id,
                role: newRole
            };

            let token = localStorage.getItem('accessToken');

            try {
                let url = new URL(backendUrl + '/api/v1/update/role');
                let response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userJSON),
                });

                if (response.status === 403 || response.status === 401) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('userRole');
                    window.location.href = loginPage;
                    return;
                }

                if (!response.ok) {
                    showNotification('Ошибка при обновлении роли пользователя', 'error');
                    return;
                }

                showNotification('Данные успешно обновлены', 'success');
            } catch (error) {
                console.error('Ошибка при обновлении роли пользователя:', error.message);
                showNotification('Ошибка при обновлении роли пользователя', 'error');
            }
        });
    } else {
        // текстовое представление роли для остальных пользователей
        roleElement = document.createElement('span');
        roleElement.className = 'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

        // определяем цвет в зависимости от роли
        switch (user.role) {
            case 'ADMIN':
                roleElement.className += ' bg-yellow-100 text-yellow-800';
                roleElement.textContent = 'Администратор';
                break;
            case 'USER':
                roleElement.className += ' bg-emerald-100 text-emerald-800';
                roleElement.textContent = 'Пользователь';
                break;
            case 'GUEST':
                roleElement.className += ' bg-blue-100 text-blue-800';
                roleElement.textContent = 'Гость';
                break;
            default:
                roleElement.className += ' bg-rose-100 text-rose-800';
                roleElement.textContent = 'Неизвестная роль';
                break;
        }
    }

    // собираем все элементы вместе
    userContainer.appendChild(userInfoContainer);
    //userContainer.appendChild(birthdayElement);
    userContainer.appendChild(roleElement);

    return userContainer;
}

export async function sendUserDataToSave() {
    try {
        let token = localStorage.getItem('accessToken');
        let name = document.getElementById('first-name').value.trim();
        let email = document.getElementById('user-email').value.trim();
        let password = document.getElementById('password').value.trim();

        let userData = {
            name: name,
            email: email,
            password: password || null,
        };

        // отправляем данные пользователя на сервер
        let url = new URL(backendUrl + '/api/v1/users');
        let response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }

        if (!response.ok) {
            showNotification('Ошибка при сохранении данных', 'error');
            return;
        }

        let result = await response.json();
        showNotification('Данные успешно обновлены', 'success');
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error.message);
        showNotification('Ошибка при сохранении данных', 'error');
    }
}

async function uploadPhotoToServer(file) {
    let token = localStorage.getItem("accessToken");
    let formData = new FormData();
    formData.append("file", file);

    let url = new URL(backendUrl + "/api/v1/users/upload");
    // отправляем фото на сервер
    let response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (response.status === 403 || response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        window.location.href = loginPage;
        return;
    }

    if (!response.ok) {
        console.log("Ошибка при загрузке фото", response);
        showNotification("Ошибка при загрузке фото", "error");
        return;
    }

    showNotification("Все супер, фото обновлено", "success");
}

export async function fetchUserData() {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(backendUrl + '/api/v1/users/account');
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 403 || response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userRole');
            window.location.href = loginPage;
            return;
        }
        
        if (!response.ok) {
            showNotification('Ошибка при получении данных', 'error');
            return;
        }
        let userData = await response.json();

        renderUserData(userData);
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        showNotification('Ошибка при получении данных', 'error');
    }
}

function renderUserData(userData) {
    if (userData) {
        document.getElementById('user-name-for-header').textContent = userData.name;
        document.getElementById('first-name').value = userData.name;
        document.getElementById('user-email').value = userData.email;
        let roleBadge = document.getElementById('user-role');
        roleBadge.textContent = 'Гость';

        switch(userData.role) {
            case 'ADMIN':
                roleBadge.textContent = 'Администратор';
                break;
            case 'USER':
                roleBadge.textContent = 'Пользователь';
                break;
            default:
                roleBadge.textContent = 'Гость';
                break;
        }

        // отображение фото
        let photoElement = document.getElementById('user-photo');
        let photoElementHeader = document.getElementById('user-photo-for-header');
        if (userData.photo && userData.photo.fileUrl) {
            photoElement.src = userData.photo.fileUrl; // url фото
            photoElementHeader.src = userData.photo.fileUrl;
        } else {
            photoElement.src = '/icons/circle-user-solid.svg'; // если изображение отсутствует
            photoElementHeader.src = '/icons/circle-user-solid.svg';
        }
    }
}

document.getElementById('file-input').addEventListener('change', (event) => {
    let file = event.target.files[0]; // получаем выбранный файл

    if (file) {
        // проверяем размер файла (максимум 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Файл слишком большой. Максимальный размер: 2MB.', 'error');
            return;
        }

        // проверяем тип файла
        let allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('Недопустимый формат файла. Разрешены только JPG, PNG и GIF.', 'error');
            return;
        }

        uploadPhotoToServer(file);
    }
});

document.getElementById('upload-photo-btn').addEventListener('click', () => {
    fileInput.click(); // имитируем клик по скрытому input
});