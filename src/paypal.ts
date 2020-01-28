import btoa from 'btoa';
import fetch from 'node-fetch';
import { getHostname } from './helpers';
import { IPayPalAccessToken } from './interfaces';
import { logger } from './logger';

export async function createAccessToken() {
    const bearer = btoa(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`);
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Authorization': `Basic ${bearer}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "grant_type=client_credentials&response_type=token"
    };


    const res = await fetch(
        `${getHostname()}/v1/oauth2/token`,
        options
    );

    const response: IPayPalAccessToken = await res.json();
    response.expires_at = Date.now() + response.expires_in;

    return response;
}

export async function listWebhooks(token: IPayPalAccessToken) {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
        },
    }
    const response = await fetch(
        `${getHostname()}/v1/notifications/webhooks`,
        options
    );
    return await response.json();
}

export async function listWebhookEventTypes(token: IPayPalAccessToken) {
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
        },
    }
    const response = await fetch(
        `${getHostname()}/v1/notifications/webhooks-event-types`,
        options
    );
    return await response.json();
}

export async function createWebhookListener(token: IPayPalAccessToken, url: string, event_types: any[]) {

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, event_types }),
    }
    const response = await fetch(
        `${getHostname()}/v1/notifications/webhooks`,
        options
    );
    return await response.json();
}

export async function deleteWebhook(token: IPayPalAccessToken, id: string) {

    const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
        },
    }
    const response = await fetch(
        `${getHostname()}/v1/notifications/webhooks/${id}`,
        options
    );
}

export async function verifyWebhookSignature(token: IPayPalAccessToken, webhook_id: string, headers: any, webhook_event: any) {

    const payload = {
        transmission_id: headers['PAYPAL-TRANSMISSION-ID'],
        transmission_time: headers['PAYPAL-TRANSMISSION-TIME'],
        cert_url: headers['PAYPAL-CERT-URL'],
        auth_algo: headers['PAYPAL-AUTH-ALGO'],
        transmission_sig: headers['PAYPAL-TRANSMISSION-SIG'],
        webhook_id,
        webhook_event
    };

    logger.info(payload);

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }
    const response = await fetch(
        `${getHostname()}/v1/notifications/verify-webhook-signature`,
        options
    );

    return await response.json();
}

export async function setupWebhookListener() {

    const url = `${process.env.HOSTNAME}/rest/webhooks/listen`;

    logger.info(`Setting up webhook listener on ${url}`);

    const token = await createAccessToken();


    // List current webhooks for account
    const response = await Promise.all([
        listWebhooks(token),
        listWebhookEventTypes(token),
    ]);


    const hook = response[0].webhooks.find((hook: any) => hook.url === url);
    const events = response[1].event_types.map((event: any) => event.status === 'ENABLED' ? { name: event.name } : undefined);

    if (hook) {
        // Remove hook
        await deleteWebhook(token, hook.id);
    }
    // Create hook
    const newhook = await createWebhookListener(token, url, events);
    logger.info(`Webhook Listener ${newhook.id} created on ${newhook.url}`);
    return newhook;
}