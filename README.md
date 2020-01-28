Lightweight development server to proxy PayPal API's.  Mostly useful for building frontend applications and demos.

## Installation
```
git clone https://github.com/trainerbill/paypal-proxy-server.git
cd paypal-proxy-server
npm install
```

Add a .env file to the project root
```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENVIRONMENT=sandbox
PORT=8080
```

## Usage
```
npm run start:dev
```

## Webhook Listener via Heroku
Its easiest to deploy this to heroku if you want to use the webhook listener

1.  Deploy the app via Heroku
2.  add the github repository.  Heroku will download, build, and start the server
3.  Add the following environment variables in addition to the ones above

```
PAYPAL_WEBHOOK_LISTENER=true
PAYPAL_WEBHOOK_VERIFY=true
HOSTNAME=https://paypal-proxy-server.herokuapp.com
```

# Test
```
curl -H "Content-Type: application/json" http://localhost:8080/rest/v2/checkout/orders --data '{"intent":"CAPTURE","purchase_units":[{"amount":{"currency_code":"USD","value":"100.00"}}]}' 
```
