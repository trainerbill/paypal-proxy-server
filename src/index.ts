import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import btoa from 'btoa';
import { createAccessToken, listWebhooks, setupWebhookListener, verifyWebhookSignature } from './paypal';
import { IPayPalAccessToken, CustomRequest } from './interfaces';
import { accessTokenMiddleware } from "./middleware";
import bodyParser from 'body-parser';
import { getHostname } from './helpers';
import cors from 'cors';
import { logger } from './logger';
import { createLogger } from 'winston';

let webhook: any;
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

if (process.env.PAYPAL_WEBHOOK_LISTENER) {

    setupWebhookListener().then(hook => webhook = hook);

    app.post('/rest/webhooks/listen', accessTokenMiddleware, async (req, res) => {
        logger.info(req.body);
        if (process.env.PAYPAL_WEBHOOK_VERIFY) {
            const response = await verifyWebhookSignature(req.accessToken, webhook.id, req.headers, req.body);
            if (response.verification_status === 'SUCCESS') {
                logger.info(`Webhook Valid!`);
            } else {
                logger.info(`Webhook Invalid!`);
            }
        }
        res.status(200).send();
    });
}



app.listen(port, () => console.log(`paypal-proxy-server app listening on port ${port}!`))