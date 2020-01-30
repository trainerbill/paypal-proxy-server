import express from "express";
import { accessTokenMiddleware } from "./middleware";
import bodyParser from "body-parser";
import cors from "cors";
import { logger } from "./logger";

import {
  createOrder,
  createAccessToken,
  verifyWebhookSignature,
  createBillingAgreement,
  createBillingAgreementToken,
  createPayment
} from 'paypal-isomorphic-functions';
import { setupWebhookListener } from "./paypal";

let webhook: any;
const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/rest/v1/oauth2/token", async (req, res) => {
  const response = await createAccessToken();
  res.send(response);
});

app.post(
  "/rest/v1/payments/payment",
  accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await createPayment(req.accessToken, req.body);
    res.json(await response.json());
  }
);

app.post(
  "/rest/v2/checkout/orders",
  accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await createOrder(req.accessToken, req.body);
    res.json(await response.json());
  }
);

app.post(
  "/rest/v1/billing-agreements/agreement-tokens",
  accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await createBillingAgreementToken(req.accessToken, req.body);
    res.json(await response.json());
  }
);

app.post(
  "/rest/v1/billing-agreements/agreements",
  accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await createBillingAgreement(req.accessToken, req.body.token_id);
    res.json(await response.json());
  }
);

if (process.env.PAYPAL_WEBHOOK_LISTENER) {
  setupWebhookListener().then(hook => (webhook = hook));

  app.post("/rest/webhooks/listen", accessTokenMiddleware, async (req, res) => {
    if (process.env.PAYPAL_WEBHOOK_VERIFY) {
      const response = await verifyWebhookSignature(
        req.accessToken,
        webhook.id,
        req.headers,
        req.body
      );
      logger.info(await response.json());
    }
    logger.info(req.body);
    res.status(200).send();
  });
}

app.listen(port, () =>
  console.log(`paypal-proxy-server app listening on port ${port}!`)
);


