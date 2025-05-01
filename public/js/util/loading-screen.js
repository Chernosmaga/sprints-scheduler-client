// функция для показа экрана загрузки
export function showLoadingScreen(elementId) {
    let loadingScreen = document.getElementById(elementId);
    loadingScreen.style.display = 'flex';
}

// функция для скрытия экрана загрузки
export function hideLoadingScreen(elementId) {
    let loadingScreen = document.getElementById(elementId);
    loadingScreen.style.display = 'none';
}