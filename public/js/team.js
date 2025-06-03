import { showNotification } from '../js/util/notification.js';
import { showUserListLoading } from '../js/util/loading-screen.js';
import { parseDate } from '../js/util/util.js';

const BACKEND_URL = window.appConfig.BACKEND_URL;
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
    class='primary-button focus:outline-none focus:ring-2 focus:ring-offset-2'
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
    let surname = document.getElementById('create-user-surname').value.trim();
    let email = document.getElementById('create-user-email').value.trim();
    let birthday = document.getElementById('create-user-birthday').value;
    let externalId = document.getElementById('create-user-external-id').value;
    let groupName = document.getElementById('create-user-group-name').value;
    let role = document.getElementById('create-user-role').value;

    if (!name) {
        showNotification('Поле с именем пользователя обзательно для заполнения', 'error');
        return;
    } else if (!surname) {
        showNotification('Поле с фамилией пользователя обзательно для заполнения', 'error');
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
        surname: surname,
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
        let url = new URL(BACKEND_URL + '/api/v1/users/admin/create');
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
        let url = new URL(BACKEND_URL + '/api/v1/users/search');
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
    showUserListLoading();

    try {
        let url = new URL(BACKEND_URL + '/api/v1/users');
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
  let userRole = localStorage.getItem('userRole');
  let userContainer = document.createElement('div');
  userContainer.className = 'user-card';

  let userInfoContainer = document.createElement('div');
  userInfoContainer.className = 'user-info-container';

  let photoElement = document.createElement('img');
  photoElement.className = 'user-photo';
  photoElement.src = user.photo?.fileUrl || '/icons/circle-user-solid.svg';
  photoElement.alt = user.name || 'photo';

  let infoContainer = document.createElement('div');
  infoContainer.className = 'user-details';

  let nameElement = document.createElement('p');
  nameElement.className = 'user-name';
  nameElement.textContent = `${user.surname} ${user.name} ${user.patronymic || ''}`;

  let emailElement = document.createElement('p');
  emailElement.className = 'user-email';
  emailElement.textContent = user.email || 'Не указан';

  infoContainer.appendChild(nameElement);
  infoContainer.appendChild(emailElement);

  userInfoContainer.appendChild(photoElement);
  userInfoContainer.appendChild(infoContainer);


  let roleElement;

  if (userRole === 'ADMIN') {
    roleElement = document.createElement('select');
    roleElement.className = 'user-role-select';

    const roles = [
      { value: 'ADMIN', label: 'Администратор' },
      { value: 'USER', label: 'Пользователь' },
      { value: 'GUEST', label: 'Гость' },
    ];

    roles.forEach(role => {
      let option = document.createElement('option');
      option.value = role.value;
      option.textContent = role.label;
      if (role.value === user.role) option.selected = true;
      roleElement.appendChild(option);
    });

    roleElement.addEventListener('change', async event => {
      const newRole = event.target.value;

      const userJSON = {
        id: user.id,
        role: newRole
      };

      const token = localStorage.getItem('accessToken');

      try {
        const url = new URL(BACKEND_URL + '/api/v1/users/update/role');
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userJSON)
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
        console.error('Ошибка при обновлении роли:', error.message);
        showNotification('Ошибка при обновлении роли', 'error');
      }
    });
  } else {
    roleElement = document.createElement('span');
    roleElement.className = 'user-role-badge';

    switch (user.role) {
      case 'ADMIN':
        roleElement.classList.add('user-role-admin');
        roleElement.textContent = 'Администратор';
        break;
      case 'USER':
        roleElement.classList.add('user-role-user');
        roleElement.textContent = 'Пользователь';
        break;
      case 'GUEST':
        roleElement.classList.add('user-role-guest');
        roleElement.textContent = 'Гость';
        break;
      default:
        roleElement.classList.add('user-role-default');
        roleElement.textContent = 'Неизвестная роль';
        break;
    }
  }

  userContainer.appendChild(userInfoContainer);
  userContainer.appendChild(roleElement);

  return userContainer;
}