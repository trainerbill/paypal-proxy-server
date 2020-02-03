import { logger } from "./logger";
import {
  Oauth,
  Webhooks
} from 'paypal-isomorphic-functions';

export async function setupWebhookListener() {
  const url = `${process.env.HOSTNAME}/rest/webhooks/listen`;

  logger.info(`Setting up webhook listener on ${url}`);

  const token = await Oauth.createAccessToken();

  // List current webhooks for account
  const response = await Promise.all([
    Webhooks.list(token),
    Webhooks.listEventTypes(token)
  ]);

  const hooks = await response[0].json();
  const events = await response[1].json();

  const hook = hooks.webhooks.find((hook: any) => hook.url === url);
  const mappedEvents = events.event_types.map((event: any) =>
    event.status === "ENABLED" ? { name: event.name } : undefined
  );

  if (hook) {
    // Remove hook
    await Webhooks.remove(token, hook.id);
  }
  // Create hook
  const res = await Webhooks.create(token, url, mappedEvents);
  const newhook = await res.json();
  logger.info(`Webhook Listener ${newhook.id} created on ${newhook.url}`);
  return newhook;
}
