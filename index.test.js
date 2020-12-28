const targetPort = (Math.round(Math.random() * 1000) + 10000).toString();
process.env.TARGET_URL = 'https://akbars-seo.content.cian.ru/';
process.env.PORT = (Math.round(Math.random() * 1000) + 10000).toString();
process.env.PREFIX = "/vitrina";
process.env.TARGET_URL = 'http://localhost:' + targetPort;


const serverPromise = require('./index');

const axios = require('axios');
const express = require('express');
const nock = require('nock');

describe('SEO Proxy', () => {
    let targetServer, server, port = Number.parseInt(process.env.PORT);
    beforeAll(async () => {
        server = await serverPromise;
        targetServer = await new Promise(resolve => {
            const app = express();
            app.get('/foo', (req, res) => res.send('BAR'));
            const srv = app.listen(targetPort, () => resolve(srv));
        });    });

    it('server started', async () => {
        expect((await axios.get(`http://localhost:${port}/ping`)).status).toBe(200);
    });

    it('return 404 on non prefix url', async () => {
        expect((await axios.get(`http://localhost:${port}/realty`, {validateStatus: () => true})).status).toBe(404);
    })

    it('proxify urls with prefix', async () => {
        nock('https://akbars-seo.content.cian.ru/')
            .get('/kupit-kvartiru')
            .reply(200, "HTML", {'Content-Type': 'text/html; charset=utf-8'});
        let axiosResponse = await axios.get(`http://localhost:${port}/vitrina/foo`);
        expect(axiosResponse.status).toBe(200);
        expect(axiosResponse.headers['content-type']).toBe('text/html; charset=utf-8');
        expect(axiosResponse.data).toBe('BAR');
    });

    afterAll(async () => {
        await Promise.app([
            new Promise(resolve => server.close(resolve)),
            new Promise(resolve => targetServer.close(resolve))
        ]);
    });
});
