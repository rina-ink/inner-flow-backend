import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: {
        status: "error",
        message: "Too many attempts. Try again later.",
    },
});