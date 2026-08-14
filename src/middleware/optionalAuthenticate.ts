import type { RequestHandler } from "express";

import { verifyAccessToken } from "../utils/jwt.js";
import { HttpError } from "../utils/httpError.js";

export const optionalAuthenticate: RequestHandler = (
    req,
    _res,
    next,
) => {
    const accessToken = req.cookies?.accessToken;

    // No token is completely fine.
    // The person continues as a guest.
    if (!accessToken) {
        return next();
    }
    
    try {
        // Token exists - identify the logged-in user.
        req.user = verifyAccessToken(accessToken);
        
        next();
    } catch {
        // A token was supplied, but it isn't valid.
        next(
            new HttpError(
                401,
                "Invalid or expired access token",
            ),
        );
    }
};