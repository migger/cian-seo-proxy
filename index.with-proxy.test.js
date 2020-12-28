const proxyPort = (Math.round(Math.random() * 1000) + 10000).toString();
const targetPort = (Math.round(Math.random() * 1000) + 10000).toString();
process.env.PORT = (Math.round(Math.random() * 1000) + 10000).toString();
process.env.PREFIX = "/vitrina";
process.env.PROXY_URL = "http://foo:bar@localhost:" + proxyPort;
process.env.TARGET_URL = 'http://localhost:' + targetPort;

const ProxyServer = require('transparent-proxy');

const serverPromise = require('./index');

const axios = require('axios');
const express = require('express');
const nock = require('nock');

describe('SEO Proxy', () => {
    let targetServer, proxyServer, server, port = Number.parseInt(process.env.PORT);
    beforeAll(async () => {
        server = await serverPromise;
        proxyServer = new ProxyServer({
            auth: (username, password) => {
                return username === 'foo' && password === 'bar';
            }
        });
        proxyServer = await new Promise(resolve => proxyServer.listen(proxyPort, 'localhost', () => resolve(proxyServer)));
        targetServer = await new Promise(resolve => {
            const app = express();
            app.get('/foo', (req, res) => res.send('BAR'));
            const srv = app.listen(targetPort, () => resolve(srv));
        });
    });

    it('use transparent proxy', async () => {
        nock('https://akbars-seo.content.cian.ru/')
            .get('/kupit-kvartiru')
            .reply(200, "HTML", {'Content-Type': 'text/html; charset=utf-8'});
        let axiosResponse = await axios.get(`http://localhost:${port}/vitrina/foo`);
        expect(axiosResponse.status).toBe(200);
        expect(axiosResponse.headers['content-type']).toBe('text/html; charset=utf-8');
        expect(axiosResponse.data).toBe('BAR');
    });

    afterAll(async () => {
        await Promise.all([
            new Promise(resolve => server.close(resolve)),
            await new Promise(resolve => proxyServer.close(resolve)),
            await new Promise(resolve => targetServer.close(resolve))
        ]);

    });
});
