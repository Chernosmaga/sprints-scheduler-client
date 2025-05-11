const loginPage = '/account/login';
const BACKEND_URL = window.appConfig.BACKEND_URL;
// глобальные переменные для диаграмм
let statusChart;
let priorityChart;
let assigneeChart;
let storyPointsChart;
let clientsChart;
let authorsChart;

// функция для получения данных об авторах
export async function fetchAuthorsData(sprintId) {
    let token = localStorage.getItem('accessToken');
    
    try {
        let url = new URL(BACKEND_URL + '/api/v1/charts/authors/' + sprintId);
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
            showNotification('Ошибка при загрузке диаграммы', 'error');
        }

        let backendData = await response.json();

        let labels = backendData.map(item => item.subject || 'Не назначен');
        let chartData = backendData.map(item => item.total || 0);

        let colors = ['#6C7A89', '#A8D8B9', '#F4E3B5', '#D0E6A5', '#B3CDE0', '#F0CFC2', '#C8BFE7', '#9DBEBB',
        '#E8D5E6', '#FFDAB9', '#BFD8B0', '#F2F2F2', '#C4D7B2', '#D3B8C9', '#AEC6CF'];

        authorsChart.data.labels = labels;
        authorsChart.data.datasets[0].data = chartData;
        authorsChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);

        authorsChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}

// функция для создания диаграммы авторов
export function createAuthorsChart(sprintId) {
    authorsChart = new Chart(document.getElementById('authorsChart-' + sprintId).getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    display: false,
                    // если нужно выводить список
                    // position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            let status = tooltipItem.label;
                            let count = tooltipItem.raw;
                            return `${status}: ${count}`;
                        },
                    },
                },
                datalabels: {
                    display: true,
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    formatter: function (value, context) {
                        return value || '';
                    },
                    anchor: 'center',
                    align: 'center',
                },
            },
        },
    });
}

// содание диаграммы клиентов
export function createClientsChart(sprintId) {
    clientsChart = new Chart(document.getElementById('clientsChart-' + sprintId).getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            cutout: '50%',
            plugins: {
                legend: {
                    //display: false,
                    // если нужно выводить список
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            let status = tooltipItem.label;
                            let count = tooltipItem.raw;
                            return `${status}: ${count}`;
                        },
                    },
                },
                datalabels: {
                    display: true,
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    formatter: function (value, context) {
                        return value || '';
                    },
                    anchor: 'center',
                    align: 'center',
                },
            },
        },
    });
}

// получение данных о клиентах
export async function fetchClientsData(sprintId) {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/charts/clients/' + sprintId);
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
            showNotification('Ошибка при загрузке диаграммы', 'error');
        }

        let backendData = await response.json();

        let labels = backendData.map(item => item.subject || 'Не назначен');
        let chartData = backendData.map(item => item.total || 0);

        let colors = ['#7F8C8D', '#BDC3C7', '#A29BFE', '#FFC67D', '#81ECEC', '#FF9F80', '#C7EFCF',
        '#D4A5A5', '#F2F0C6', '#B2E2E2', '#E8EAF6', '#FFD7B5', '#CCE6CF', '#F8E3E3', '#D1D1E0'];

        clientsChart.data.labels = labels;
        clientsChart.data.datasets[0].data = chartData;
        clientsChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);

        clientsChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}

// функция для отрисовки диаграммы для story points
export function createStoryPointsChart(sprintId) {
    storyPointsChart = new Chart(document.getElementById('storyPointsChart-' + sprintId).getContext('2d'), {
        type: 'bar', // тип диаграммы (столбчатая)
        data: {
            labels: [], // пустые метки
            datasets: [
                {
                    label: 'Количество задач', // подпись для данных
                    data: [], // пустые данные
                    backgroundColor: [], // пустые цвета
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true, // диаграмма адаптируется под размер контейнера
            scales: {
                y: {
                    beginAtZero: true, // ось Y начинается с нуля
                    grid: {
                        display: true, // отображение сетки по оси Y
                    },
                },
                x: {
                    grid: {
                        display: false, // скрываем сетку по оси X
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            let label = tooltipItem.label;
                            let value = tooltipItem.raw;
                            return `${label}: ${value}`;
                        },
                    },
                },
            },
        },
    });
}

// получение данных для диаграммы story points
export async function fetchStoryPointsData(sprintId) {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/charts/points/' + sprintId);
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

        // проверяем статус ответа
        if (!response.ok) {
            showNotification('Ошибка при загрузке диаграммы', 'error');
        }

        // получаем данные в формате JSON
        let backendData = await response.json();

        // преобразуем данные в формат, подходящий для Chart.js
        let labels = backendData.map(item => item.subject); // метки (subject)
        let chartData = backendData.map(item => item.total || 0); // данные (total)

        // цвета для диаграммы
        let colors = ['#343a57'];

        // обновляем данные диаграммы
        storyPointsChart.data.labels = labels; // обновляем метки
        storyPointsChart.data.datasets[0].data = chartData; // обновляем данные
        storyPointsChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length); // обновляем цвета

        // перерисовываем диаграмму
        storyPointsChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}

// функция для получения данных о количестве задач на разработчика и обновления диаграммы
export async function fetchAssigneeData(sprintId) {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/charts/developers/' + sprintId);
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
            showNotification('Ошибка при загрузке диаграммы', 'error');
        }

        let backendData = await response.json();

        let labels = backendData.map(item => item.subject || 'Не назначен');
        let chartData = backendData.map(item => item.total || 0);

        let colors = ['#343a57'];

        assigneeChart.data.labels = labels;
        assigneeChart.data.datasets[0].data = chartData;
        assigneeChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);

        assigneeChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}

// функция для создания пустой диаграммы для количества задач на разработчика
export function createAssigneeChart(sprintId) {
    assigneeChart = new Chart(document.getElementById('assigneeChart-' + sprintId).getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Количество задач',
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true, // диаграмма адаптируется под размер контейнера
            scales: {
                y: {
                    beginAtZero: true, // ось Y начинается с нуля
                    grid: {
                        display: true, // отображение сетки по оси Y
                    },
                },
                x: {
                    grid: {
                        display: false, // скрываем сетку по оси X
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            let label = tooltipItem.label;
                            let value = tooltipItem.raw;
                            return `${label}: ${value}`;
                        },
                    },
                },
            },
        },
    });
}

// функция для создания пустой диаграммы приоритетов
export function createPriorityChart(sprintId) {
    priorityChart = new Chart(document.getElementById('priorityChart-' + sprintId).getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
}

// функция для получения данных о приоритетах и обновления диаграммы
export async function fetchPriorityData(sprintId) {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/charts/priorities/' + sprintId);
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
            showNotification('Ошибка при загрузке диаграммы', 'error');
        }

        let backendData = await response.json();

        let labels = backendData.map(item => item.subject || 'Неизвестный');
        let chartData = backendData.map(item => item.total || 0);

        let colors = {
            HIGH: '#EF4444',
            MEDIUM: '#F59E0B',
            LOW: '#10B981'
        };

        let backgroundColors = labels.map(label => colors[label] || '#9CA3AF');

        priorityChart.data.labels = labels;
        priorityChart.data.datasets[0].data = chartData;
        priorityChart.data.datasets[0].backgroundColor = backgroundColors;

        priorityChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}

// функция для создания диаграммы статусов
export function createStatusChart(sprintId) {
    statusChart = new Chart(document.getElementById('statusChart-' + sprintId).getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'left',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            let status = tooltipItem.label;
                            let count = tooltipItem.raw;
                            return `${status}: ${count}`;
                        },
                    },
                },
                datalabels: {
                    display: true,
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    formatter: function (value, context) {
                        return value || '';
                    },
                    anchor: 'center',
                    align: 'center',
                },
            },
        },
    });
}

// функция для получения данных о статусах и обновления диаграммы
export async function fetchStatuses(sprintId) {
    let token = localStorage.getItem('accessToken');

    try {
        let url = new URL(BACKEND_URL + '/api/v1/charts/statuses/' + sprintId);
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
            showNotification('Ошибка при загрузке диаграммы', 'error');
        }

        let backendData = await response.json();
        let labels = backendData.map(item => item.subject);
        let data = backendData.map(item => item.total);

        let colors = ['#87CEEB', '#B0E0E6', '#D8BFD8', '#FFDAB9', '#C8E6C9', '#F0F4C3', '#EAEAEA'];

        statusChart.data.labels = labels;
        statusChart.data.datasets[0].data = data;
        statusChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);

        statusChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}