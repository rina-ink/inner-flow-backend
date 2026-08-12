import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";
import { isProduction } from "../config.js";

export const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next,
) => {
    // 1. validation errors from Zod
    if (err instanceof ZodError) {
        const formattedError = err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
        
        return res.status(400).json({
            status: "error",
            message: "Validation error",
            errors: formattedError,
        });
    }

    // 2. safety net for duplicate unique values
    if (err?.code === 11000) {
        return res.status(409).json({
            status: "error",
            message: "Email already in use",
        });
    }

    // 3. errors intentionally thrown
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
    }

    // 4. unexpected errors
    console.error("Unexpected error:", err);
    
    res.status(500).json({
        status: "error",
        message: isProduction
            ? "Internal server error"
            : err?.message || "Internal server error",
    });
};