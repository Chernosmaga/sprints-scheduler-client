// вспомогательная функция для расчета процента выполнения
export function getProgressPercentage(start, end) {
    let today = new Date(); // текущая дата

    // если текущая дата раньше начала спринта, прогресс = 0%
    if (today < start) return 0;

    // если текущая дата позже окончания спринта, прогресс = 100%
    if (today > end) return 100;

    // вычисляем общее количество дней в спринте
    let totalDays = (end - start) / (1000 * 60 * 60 * 24);

    // вычисляем, сколько дней прошло с начала спринта
    let elapsedDays = (today - start) / (1000 * 60 * 60 * 24);

    // рассчитываем процент прогресса
    let progress = (elapsedDays / totalDays) * 100;

    return Math.min(Math.max(progress, 0), 100); // ограничиваем значение от 0 до 100
}

export function parseDate(dateString) {
    let date = new Date(dateString);

    let day = String(date.getDate()).padStart(2, '0'); // день (с ведущим нулём)
    let month = String(date.getMonth() + 1).padStart(2, '0'); // месяц (с ведущим нулём, +1 так как месяцы начинаются с 0)
    let year = date.getFullYear(); // год

    // формируем новую строку в формате dd.MM.yyyy
    return `${day}.${month}.${year}`;
}

// отрисовка кнопок, если пользователь ADMIN или USER
export function createButton(buttonData) {
    // создаем элемент кнопки
    let button = document.createElement('button');
    button.id = buttonData.id;
    button.className = 'primary-button flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2';

    // добавляем иконку
    let img = document.createElement('img');
    img.src = buttonData.icon;
    img.alt = buttonData.alt;
    img.className = 'w-4 h-4 mr-2';
    button.appendChild(img);

    // добавляем текст
    let span = document.createElement('span');
    span.textContent = buttonData.text;
    button.appendChild(span);

    // добавляем обработчик события
    button.addEventListener('click', buttonData.onClick);

    return button;
}