// вспомогательная функция для расчета процента выполнения
export function getProgressPercentage(start, end) {
    var today = new Date(); // текущая дата

    // если текущая дата раньше начала спринта, прогресс = 0%
    if (today < start) return 0;

    // если текущая дата позже окончания спринта, прогресс = 100%
    if (today > end) return 100;

    // вычисляем общее количество дней в спринте
    var totalDays = (end - start) / (1000 * 60 * 60 * 24);

    // вычисляем, сколько дней прошло с начала спринта
    var elapsedDays = (today - start) / (1000 * 60 * 60 * 24);

    // рассчитываем процент прогресса
    var progress = (elapsedDays / totalDays) * 100;

    return Math.min(Math.max(progress, 0), 100); // ограничиваем значение от 0 до 100
}

export function parseDate(dateString) {
    var date = new Date(dateString);

    var day = String(date.getDate()).padStart(2, '0'); // день (с ведущим нулём)
    var month = String(date.getMonth() + 1).padStart(2, '0'); // месяц (с ведущим нулём, +1 так как месяцы начинаются с 0)
    var year = date.getFullYear(); // год

    // формируем новую строку в формате dd.MM.yyyy
    return `${day}.${month}.${year}`;
}

// отрисовка кнопок, если пользователь ADMIN или USER
export function createButton(buttonData) {
    // создаем элемент кнопки
    const button = document.createElement('button');
    button.id = buttonData.id;
    button.className = 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none flex items-center text-base';

    // добавляем иконку
    const img = document.createElement('img');
    img.src = buttonData.icon;
    img.alt = buttonData.alt;
    img.className = 'w-5 h-5 mr-2';
    button.appendChild(img);

    // добавляем текст
    const span = document.createElement('span');
    span.textContent = buttonData.text;
    button.appendChild(span);

    // добавляем обработчик события
    button.addEventListener('click', buttonData.onClick);

    return button;
}