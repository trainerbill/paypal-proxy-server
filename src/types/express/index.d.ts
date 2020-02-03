import { Request } from "express";
import { Oauth } from "paypal-isomorphic-functions";

declare global {
  namespace Express {
    export interface Request {
      paypalAccessToken: Oauth.IPayPalAccessToken;
    }
  }
}
