const notificationContainer = document.getElementById('notification-container');

// экспортируемая функция для показа уведомления
export function showNotification(message, type = 'success') {
    // определяем путь к изображению в зависимости от типа уведомления
    let iconPath;
    if (type === 'success') {
        iconPath = '/icons/thumbs-up-solid.svg';
    } else if (type === 'error') {
        iconPath = '/icons/circle-exclamation-solid.svg';
    } else {
        iconPath = '/icons/circle-question-solid.svg';
    }

    // создаем контейнер уведомления
    let notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // создаем элемент изображения
    let icon = document.createElement('img');
    icon.src = iconPath; // устанавливаем путь к изображению
    icon.alt = 'Уведомление'; // альтернативный текст
    icon.className = 'notification-icon'; // добавляем класс для стилизации

    // создаем элемент для текста
    let text = document.createElement('span');
    text.textContent = message;

    // добавляем иконку и текст в контейнер уведомления
    notification.appendChild(icon);
    notification.appendChild(text);

    // добавляем уведомление в контейнер на странице
    notificationContainer.appendChild(notification);

    // удаляем уведомление через 5 секунд
    setTimeout(() => {
        notification.remove();
    }, 5000);
}