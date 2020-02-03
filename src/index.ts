import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { logger } from "./logger";

import {
  Orders,
  Oauth,
  Payments,
  BillingAgreements,
  Webhooks,
  Middleware
} from "paypal-isomorphic-functions";
import { setupWebhookListener } from "./paypal";

let webhook: any;
const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/rest/v1/oauth2/token", async (req, res) => {
  const response = await Oauth.createAccessToken();
  res.send(response);
});

app.post(
  "/rest/v1/payments/payment",
  Middleware.accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await Payments.create(req.paypalAccessToken, req.body);
    res.json(await response.json());
  }
);

app.post(
  "/rest/v2/checkout/orders",
  Middleware.accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await Orders.create(req.paypalAccessToken, req.body);
    res.json(await response.json());
  }
);

app.post(
  "/rest/v2/checkout/orders/:id/authorize",
  Middleware.accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await Orders.authorize(
      req.paypalAccessToken,
      req.params.id,
      req.body
    );
    res.json(await response.json());
  }
);

app.post(
  "/rest/v2/checkout/orders/:id/capture",
  Middleware.accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await Orders.capture(
      req.paypalAccessToken,
      req.params.id,
      req.body
    );
    res.json(await response.json());
  }
);

app.post(
  "/rest/v2/payments/authorizations/:id/capture",
  Middleware.accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await Payments.capture(
      req.paypalAccessToken,
      req.params.id,
      req.body
    );
    res.json(await response.json());
  }
);

app.post(
  "/rest/v1/billing-agreements/agreement-tokens",
  Middleware.accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await BillingAgreements.createToken(
      req.paypalAccessToken,
      req.body
    );
    res.json(await response.json());
  }
);

app.post(
  "/rest/v1/billing-agreements/agreements",
  Middleware.accessTokenMiddleware,
  async (req, res) => {
    logger.verbose(`Body: ${req.body}`);
    const response = await BillingAgreements.create(
      req.paypalAccessToken,
      req.body.token_id
    );
    res.json(await response.json());
  }
);

if (process.env.PAYPAL_WEBHOOK_LISTENER) {
  setupWebhookListener().then(hook => (webhook = hook));

  app.post(
    "/rest/webhooks/listen",
    Middleware.accessTokenMiddleware,
    async (req, res) => {
      if (process.env.PAYPAL_WEBHOOK_VERIFY) {
        const response = await Webhooks.verify(
          req.paypalAccessToken,
          webhook.id,
          req.headers,
          req.body
        );
        logger.info(await response.json());
      }
      logger.info(req.body);
      res.status(200).send();
    }
  );
}

app.listen(port, () =>
  console.log(`paypal-proxy-server app listening on port ${port}!`)
);
