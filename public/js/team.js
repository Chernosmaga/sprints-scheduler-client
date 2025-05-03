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

export function renderCreateUserButton() {
    let buttonContainer = document.getElementById('create-user-button-container');

    buttonContainer.innerHTML = `
  <button
    type='button'
    class='mt-9 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10 whitespace-nowrap'
    id='create-user-button'
  >
    <i class='fas fa-plus mr-2'></i>
    Создать пользователя
  </button>
`;
}

// открытие модального окна
export function openCreateUserModal() {
    let modal = document.getElementById('create-user-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// закрытие модального окна
export function closeCreateUserModal() {
    let modal = document.getElementById('create-user-modal');
    let form = document.getElementById('create-user-form');

    if (modal) {
        modal.classList.add('hidden');
    }

    if (form) {
        form.reset();
    }
}

// Обработка отправки формы
document.getElementById('create-user-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    let name = document.getElementById('create-user-name').value.trim();
    let email = document.getElementById('create-user-email').value.trim();
    let birthday = document.getElementById('create-user-birthday').value;
    let externalId = document.getElementById('create-user-external-id').value;
    let groupName = document.getElementById('create-user-group-name').value;
    let role = document.getElementById('create-user-role').value;

    if (!name) {
        showNotification('Поле с именем пользователя обзательно для заполнения', 'error');
        return;
    } else if (!email) {
        showNotification('Поле с электронной почтой обзательно для заполнения', 'error');
        return;
    } else if (!birthday) {
        showNotification('Поле с датой рождения обзательно для заполнения', 'error');
        return;
    } else if (!role) {
        showNotification('Поле с ролью пользователя обзательно для заполнения', 'error');
        return;
    }

    switch(role) {
        case 'Пользователь':
            role = 'USER';
            break;
        case 'Администратор':
            role = 'ADMIN';
            break;
        default:
            role = 'GUEST';
            break;
    }

    let userJSON = {
        name: name,
        email: email,
        role: role,
        birthday: birthday,
        externalGroupId: externalId,
        externalGroupName: groupName
    };
    
    let token = localStorage.getItem('accessToken');
    console.log(userJSON);
    createNewUser(token, userJSON);
});

async function createNewUser(token, userJSON) {
    try {
        let url = new URL(backendUrl + '/api/v1/users/admin/create');
        let response = await fetch(url, {
            method: 'POST',
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
            showNotification('Ошибка при сохранении данных', 'error');
            closeCreateUserModal();
            return;
        }

        let result = await response.json();
        showNotification('Новый пользователь сохранён, данные для входа отправлены на почту', 'success');
        closeCreateUserModal();
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error.message);
        showNotification('Ошибка при сохранении данных', 'error');
        closeCreateUserModal();
    }
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
    let userRole = localStorage.getItem('userRole'); // роль текущего пользователя
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
                let url = new URL(backendUrl + '/api/v1/users/update/role');
                let response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userJSON),
                });

                console.log(JSON.stringify(userJSON, null, 2));

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