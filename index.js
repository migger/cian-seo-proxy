const express = require('express');
const axios = require('axios');

let proxyUrl;
if (process.env.PROXY_URL) {
    proxyUrl = new URL(process.env.PROXY_URL);
}
module.exports = new Promise(async (resolve) => {
    const app = express();
    app.get('/ping', async (req, res) => {
        res.send('pong');
    });

    const router = new express.Router();
    router.get('*', async (req, res) => {
        let config = {};
        if(proxyUrl) {
            config.proxy = {
                host: proxyUrl.hostname,
                port: proxyUrl.port,
            };
            if(proxyUrl.username && proxyUrl.password) {
                config.proxy.auth = {
                    username: proxyUrl.username,
                    password: proxyUrl.password,
                }
            }
        }
        const response = await axios.get(`${process.env.TARGET_URL || 'http://akbars-seo.content.cian.ru'}${req.url}`, config);
        res.header('content-type', response.headers['content-type']);
        res.status(response.status);
        res.send(response.data);
    });
    app.use(process.env.PREFIX, router);


    const server = app.listen(Number.parseInt(process.env.PORT || "8080"), () => resolve(server));
});
