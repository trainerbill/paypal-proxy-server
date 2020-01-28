import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import btoa from 'btoa';
import { createAccessToken } from './paypal';
import { IPayPalAccessToken, CustomRequest } from './interfaces';
import { accessTokenMiddleware } from "./middleware";
import bodyParser from 'body-parser';
import { getHostname } from './helpers';
import cors from 'cors';

const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors());


app.post('/rest/v1/oauth2/token', async (req, res) => {
    const response = await createAccessToken();
    res.send(response);
})

app.post('/rest/v2/checkout/orders', accessTokenMiddleware, async (req, res) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${req.accessToken.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    }
    const response = await fetch(
        `${getHostname()}/v2/checkout/orders`,
        options
    );
    res.json(await response.json());
});

app.post('/rest/v2/checkout/orders', accessTokenMiddleware, async (req, res) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${req.accessToken.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
    }
    const response = await fetch(
        `${getHostname()}/v2/checkout/orders`,
        options
    );
    res.json(await response.json());
});

app.get('/rest/webhooks', accessTokenMiddleware, async (req, res) => {

    res.json({ test: 'I am Webhooks' });
});

app.listen(port, () => console.log(`paypal-proxy-server app listening on port ${port}!`))