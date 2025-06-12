const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer();

module.exports = (backendUrl) => {
    return (req, res, next) => {
        if (!req.originalUrl.startsWith('/api')) {
            return next();
        }

        const target = backendUrl;

        //console.log(`[Proxy] Перехват: ${req.method} ${req.originalUrl} → ${target}${req.originalUrl}`);

        proxy.web(req, res, { target }, (err) => {
            console.error('[Proxy] Ошибка:', err.message);
            res.status(500).json({ error: 'Ошибка прокси' });
        });
    };
};