export function getHostname() {
  return process.env.PAYPAL_ENVIRONMENT === "sandbox"
    ? "https://api.sandbox.paypal.com"
    : "https://api.paypal.com";
}
