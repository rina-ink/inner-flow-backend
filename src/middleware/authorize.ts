import type { RequestHandler } from "express";

import { HttpError } from "../utils/httpError.js";

export const authorize =
    (...allowedRoles: string[]): RequestHandler =>
        (req, _res, next) => {
            if (!req.user) {
                return next(
                    new HttpError(401, "Not authenticated"),
                );
            }
            
            const hasPermission = req.user.roles.some(
                (role) => allowedRoles.includes(role),
            );
            
            if (!hasPermission) {
                return next(
                    new HttpError(403, "Not authorized"),
                );
            }
            
            next();
        };