import type { RequestHandler } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import type { AccessTokenPayload } from "../utils/jwt.js";
import { HttpError } from "../utils/httpError.js";

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

export const authenticate: RequestHandler = (req, res, next) => {
  // 1. the access token lives in a httpOnly cookie
    const accessToken = req.cookies?.accessToken;
    
    if (!accessToken) {
        return next(new HttpError(401, "Not Authenticated"));
    }
    
    try {
    // 2. throws if the token was tampered with or expired
        req.user = verifyAccessToken(accessToken);
        
        next();
    } catch (error: any) {
    // 3. expired token is a special case:
    // the frontend can try /auth/refresh before logging the user out
        if (error?.name === "TokenExpiredError") {
            res.setHeader("WWW-Authenticate", "token_expired");
            
            return next(
                new HttpError(401, "Access token expired"),
            );
        }
        
        next(new HttpError(401, "Invalid token"));
    }
};