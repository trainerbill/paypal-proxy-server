import { IPayPalAccessToken, CustomRequest } from './interfaces';
import { createAccessToken } from './paypal';
import { Request, Response, NextFunction } from 'express';


let accessToken: IPayPalAccessToken;

export async function accessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!accessToken || accessToken.expires_at > Date.now()) {
        accessToken = await createAccessToken();
    }
    req.accessToken = accessToken;
    return next();
}