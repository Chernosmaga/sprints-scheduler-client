const loginPage = '/account/login';
const BACKEND_URL = window.appConfig.BACKEND_URL;
// глобальные переменные для диаграмм
let statusChart;
let priorityChart;
let assigneeChart;
let storyPointsChart;
let clientsChart;
let authorsChart;
const colors = [
  "#6C7A89", "#A8D8B9", "#F4E3B5", "#D0E6A5", "#B3CDE0", "#F0CFC2", "#C8BFE7",
  "#9DBEBB", "#E8D5E6", "#FFDAB9", "#BFD8B0", "#F2F2F2", "#C4D7B2", "#D3B8C9",
  "#AEC6CF", "#7F8C8D", "#BDC3C7", "#A29BFE", "#FFC67D", "#81ECEC", "#FF9F80",
  "#C7EFCF", "#D4A5A5", "#F2F0C6", "#B2E2E2", "#E8EAF6", "#FFD7B5", "#CCE6CF",
  "#F8E3E3", "#D1D1E0", "#87CEEB", "#B0E0E6", "#D8BFD8", "#C8E6C9", "#F0F4C3", "#EAEAEA"
];

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
    let textColor = returnTextColor();
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
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            radius: '80%',
            color: textColor,
            plugins: {
                legend: {
                    //display: false,
                    // если нужно выводить список
                    position: 'right',
                    labels: {
                        font: {
                            size: 10,
                        },
                        boxWidth: 10,
                    },
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
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    formatter: function (value) {
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
    let textColor = returnTextColor();
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
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            radius: '80%',
            color: textColor,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 10,
                        },
                        boxWidth: 10,
                    },
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
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    formatter: function (value) {
                        return value || '';
                    },
                    anchor: 'center',
                    align: 'center',
                },
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
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
    let textColor = returnTextColor();
    storyPointsChart = new Chart(document.getElementById('storyPointsChart-' + sprintId).getContext('2d'), {
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
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true
                    },
                    ticks: {
                        color: textColor,
                    },
                },
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: textColor,
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

        // обновляем данные диаграммы
        storyPointsChart.data.labels = labels; // обновляем метки
        storyPointsChart.data.datasets[0].data = chartData; // обновляем данные
        storyPointsChart.data.datasets[0].backgroundColor = returnChartColor();

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

        assigneeChart.data.labels = labels;
        assigneeChart.data.datasets[0].data = chartData;
        assigneeChart.data.datasets[0].backgroundColor = returnChartColor();

        assigneeChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}

// функция для создания пустой диаграммы для количества задач на разработчика
export function createAssigneeChart(sprintId) {
    let textColor = returnTextColor();
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
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true, // ось Y начинается с нуля
                    grid: {
                        display: true, // отображение сетки по оси Y
                    },
                    ticks: {
                        color: textColor,
                    },
                },
                x: {
                    grid: {
                        display: false, // скрываем сетку по оси X
                    },
                    ticks: {
                        color: textColor,
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
    let textColor = returnTextColor();
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
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                    },
                },
                x: {
                    ticks: {
                        color: textColor,
                    },
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
    let textColor = returnTextColor();
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
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            color: textColor,
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

        statusChart.data.labels = labels;
        statusChart.data.datasets[0].data = data;
        statusChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);

        statusChart.update();
    } catch (error) {
        console.error('Error fetching or updating chart data:', error);
    }
}

function returnTextColor() {
    let isDarkTheme = localStorage.getItem('theme') === "dark";
    return isDarkTheme ? '#d6d6d6' : '#4b5563';
}

function returnChartColor() {
    let isDarkTheme = localStorage.getItem('theme') === "dark";
    return isDarkTheme ? '#9FA6C8' : '#343a57';
}