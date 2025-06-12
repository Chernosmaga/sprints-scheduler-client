import { showNotification } from '../js/util/notification.js';
import { refreshToken } from '../js/util/util.js';

let baseUrl = window.location.origin;

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
        let url = new URL(`${baseUrl}/api/v1/users`);
        let response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        refreshToken(response);

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

    let url = new URL(`${baseUrl}/api/v1/users/upload`);
    // отправляем фото на сервер
    let response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    refreshToken(response);

    if (!response.ok) {
        console.log("Ошибка при загрузке фото", response);
        showNotification("Ошибка при загрузке фото", "error");
        return;
    }

    showNotification("Все супер, фото обновлено", "success");
    fetchUserData();
}

export async function fetchUserData() {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(`${baseUrl}/api/v1/users/account`);
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        refreshToken(response);
        
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
        document.getElementById('user-name-for-header').textContent = userData.surname + " " +  userData.name + " " + (userData.patronymic || '');
        document.getElementById('first-name').value = userData.surname + " " +  userData.name + " " + (userData.patronymic || '');
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
    let fileInput = document.getElementById('file-input');
    fileInput.click();
});