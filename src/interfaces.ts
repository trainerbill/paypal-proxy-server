import { Request } from "express";

export interface IPayPalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  expires_at: number;
  nonce: string;
}

export interface CustomRequest extends Request {
  accessToken: IPayPalAccessToken;
}
