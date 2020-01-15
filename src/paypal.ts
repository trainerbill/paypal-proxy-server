import btoa from 'btoa';
import fetch from 'node-fetch';
import { getHostname } from './helpers';
import { IPayPalAccessToken } from './interfaces';

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