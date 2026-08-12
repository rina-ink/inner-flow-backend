import { Router } from "express";
import {
    login,
    register,
    logout,
    refresh,
    me,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateBodyZod } from "../middleware/validateBodyZod.js";
import {
    loginSchema,
    registerSchema,
} from "../schemas/auth.schemas.js";

const authRouter = Router();

// -------------------------
// REGISTER
// -------------------------

authRouter.post(
    "/register",
    authLimiter,
    validateBodyZod(registerSchema),
    register,
);

// -------------------------
// LOGIN
// -------------------------

authRouter.post(
    "/login",
    authLimiter,
    validateBodyZod(loginSchema),
    login,
);

// -------------------------
// REFRESH TOKEN
// -------------------------

authRouter.post("/refresh", refresh);

// -------------------------
// LOGOUT
// -------------------------

authRouter.delete("/logout", logout);

// -------------------------
// CURRENT USER
// -------------------------

authRouter.get("/me", authenticate, me);

export default authRouter;