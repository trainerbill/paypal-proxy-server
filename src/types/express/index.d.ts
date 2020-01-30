import { Request } from "express";
import { IPayPalAccessToken } from "../../interfaces";

declare global {
  namespace Express {
    export interface Request {
      accessToken: IPayPalAccessToken;
    }
  }
}
