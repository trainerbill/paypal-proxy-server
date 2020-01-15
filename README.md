Lightweight development server to proxy PayPal API's.  Mostly useful for building frontend applications and demos.

## Installation
```
git clone
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

```
curl -H "Content-Type: application/json" http://localhost:8080/rest/v2/checkout/orders --data '{"intent":"CAPTURE","purchase_units":[{"amount":{"currency_code":"USD","value":"100.00"}}]}' 
```
