require('dotenv').config();

const express = require('express');
const path = require('path');
const proxy = require('./proxy');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT;
const backendUrl = process.env.BACKEND_URL;

app.use(express.json());
app.use(cors());

// раздача статических файлов из папки 'public' и кэширование данных
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.match(/\.(js|css|png|svg|jpg|jpeg|gif|ico|woff2)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
        window.appConfig = {
            BACKEND_URL: "${process.env.BACKEND_URL}",
            SIMPLE_ONE_URL: "${process.env.SIMPLE_ONE_URL}"
        };
    `);
});

app.use(proxy(backendUrl));

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

// маршруты для страниц регистрации
app.get('/account/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'create-account.html'));
});

app.get('/account/create/confirm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'confirm.html'));
});

app.get('/account/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'verify.html'));
});

app.get('/account/create/password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'set-password.html'));
});

// маршруты для страниц сброса пароля
app.get('/password/reset/request', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'forgot-password.html'));
});

app.get('/password/reset/confirm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/auth', 'password-confirm.html'));
});

// обработка ошибок 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public/templates', 'not-found.html'));
});