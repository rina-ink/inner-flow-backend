import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateBodyZod =
    <T extends ZodType>(schema: T): RequestHandler =>
        (req, _res, next) => {
            const parsed = schema.safeParse(req.body);
            
            if (!parsed.success) {
                return next(parsed.error);
            }
            
            req.body = parsed.data;
            
            next();
        };