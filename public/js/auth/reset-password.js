// получение данных из формы для сброса пароля
document.querySelector('form').addEventListener('reset-password', function (e) {
    e.preventDefault();
    let password = document.getElementById('user-email').value;

    showNotification('Успешно!', 'success');
});

document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordButton = document.getElementById('reset-password');
    const codeContainer = document.getElementById('code-container');

    // Обработчик события для кнопки 'Отправить код подтверждения'
    resetPasswordButton.addEventListener('click', (event) => {
        event.preventDefault(); // Предотвращаем отправку формы

        // Показываем контейнер с новыми элементами
        codeContainer.classList.remove('hidden');
    });

    // Пример обработчиков для новых кнопок
    const resendCodeButton = document.getElementById('resend-code');
    const confirmCodeButton = document.getElementById('confirm-code');

    resendCodeButton.addEventListener('click', (event) => {
        event.preventDefault();
        alert('Код отправлен повторно!');
        // Здесь можно добавить логику для повторной отправки кода
    });

    confirmCodeButton.addEventListener('click', (event) => {
        event.preventDefault();
        const confirmationCode = document.getElementById('confirmation-code').value;

        if (confirmationCode.trim() === '') {
            alert('Введите код подтверждения!');
        } else {
            alert(`Код подтвержден: ${confirmationCode}`);
            // Здесь можно добавить логику для проверки кода
        }
    });
});