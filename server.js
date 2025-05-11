require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const cors = require('cors');
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

// раздача статических файлов из папки 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        window.appConfig = {
            BACKEND_URL: "${process.env.BACKEND_URL}",
            SIMPLE_ONE_URL: "${process.env.SIMPLE_ONE_URL}"
        };
    `);
});

// маршруты для основных страниц
app.get('/backlog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'main.html'));
});

app.get('/current/sprint', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'main.html'));
});

app.get('/create/sprint', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'main.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'main.html'));
});

app.get('/account/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'main.html'));
});

app.get('/team/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates', 'main.html'));
});

// маршруты для страниц авторизации
app.get('/account/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'login.html'));
});

app.get('/account/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'login.html'));
});

app.get('/account/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'create-account.html'));
});

app.get('/account/forgot/password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'forgot-password.html'));
});

app.get('/account/password/reset/request', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'reset-password.html'));
});

app.get('/account/password/reset/confirm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'verify.html'));
});

app.get('/account/setup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'set-up.html'));
});

// обработка ошибок 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public/templates', 'not-found.html'));
});

// запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});