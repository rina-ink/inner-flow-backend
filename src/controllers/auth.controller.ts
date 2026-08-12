import z from "zod";
import type {
    loginSchema,
    registerSchema,
} from "../schemas/auth.schemas.js";
import {
    isProduction,
    REFRESH_TOKEN_TTL,
    SALT_ROUNDS,
} from "../config.js";
import type { Types } from "mongoose";
import {
    generateRefreshTokenString,
    hashToken,
} from "../utils/token.js";
import RefreshToken from "../models/RefreshToken.js";
import type { RequestHandler } from "express";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import bcrypt from "bcrypt";
import { createAccessToken } from "../utils/jwt.js";

// -------------------------------
// TYPES
// -------------------------------

type RegisterBody = z.infer<typeof registerSchema>;
type LoginBody = z.infer<typeof loginSchema>;

// -------------------------------
// COOKIE CONFIGURATION
// -------------------------------

const ACCESS_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isProduction,
    maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,  // stops XSS attacks
    sameSite: "strict" as const,  // stops CSRF attacks
    secure: isProduction,
    maxAge: REFRESH_TOKEN_TTL * 1000,
};

// -------------------------------
// SESSION HELPERS
// -------------------------------

const MAX_SESSIONS_PER_USER = 5;

// Create a refresh token for the user:
// - generate the raw random token
// - store only its hash in the database
// - return the raw string so it can be stored in the cookie

async function issueRefreshToken(
    userId: Types.ObjectId,
): Promise<string> {
    const refreshTokenString =
    generateRefreshTokenString();
    
    await RefreshToken.create({
        tokenHash: hashToken(refreshTokenString),
        userId,
    });
    
    return refreshTokenString;
}

// Allow only the 5 newest active sessions per user

async function enforceSessionLimit(
    userId: Types.ObjectId,
): Promise<void> {
    const excess = await RefreshToken.find({
        userId,
        revokedAt: null,
    })
    .sort({ createdAt: -1 })
    .skip(MAX_SESSIONS_PER_USER)
    .select("_id")
    .lean();
    
    if (excess.length > 0) {
        await RefreshToken.deleteMany({
            _id: {
                $in: excess.map((token) => token._id),
            },
        });
    }
}

// ==============================
// REGISTER CONTROLLER
// ==============================

export const register: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        // 1. Extract validated data from the request body
        
        const {
            email,
            password,
            firstName,
            lastName,
        } = req.body as Omit<
        RegisterBody,
        "confirmPassword"
        >;
        
        // 2. Friendly duplicate-email check

        const existing = await User.findOne({
            email,
        }).lean();
        
        if (existing) {
            throw new HttpError(
                409,
                "Email already in use",
            );
        }

        // 3. Hash the password
        // Never store a plain-text password

        const hashedPassword = await bcrypt.hash(
            password,
            SALT_ROUNDS,
        );

        // 4. Create the user

        const newUser = await User.create({
            email,
            password: hashedPassword,
            roles: ["user"],
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        });

        // 5. Generate access + refresh tokens

        const accessToken = createAccessToken({
            userId: newUser._id.toString(),
            roles: newUser.roles,
        });

        const refreshTokenString =
        await issueRefreshToken(newUser._id);

        // 6. Store tokens in HTTP-only cookies

        res.cookie(
            "accessToken",
            accessToken,
            ACCESS_COOKIE_OPTIONS,
        );

        res.cookie(
            "refreshToken",
            refreshTokenString,
            REFRESH_COOKIE_OPTIONS,
        );

        // 7. Respond with safe user data

        res.status(201).json({
            message: "User registered",
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                roles: newUser.roles,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// LOGIN CONTROLLER
// ==============================

export const login: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { email, password } =
        req.body as LoginBody;

        // 1. Find the user by email

        const user = await User.findOne({
            email,
        });
        
        // Generic response for wrong email or password

        if (!user) {
            throw new HttpError(
                401,
                "Incorrect credentials",
            );
        }

        // 2. Compare submitted password with stored hash

        const ok = await bcrypt.compare(
            password,
            user.password,
        );
        
        if (!ok) {
            throw new HttpError(
                401,
                "Incorrect credentials",
            );
        }

        // 3. Generate access + refresh tokens

        const accessToken = createAccessToken({
            userId: user._id.toString(),
            roles: user.roles,
        });

        const refreshTokenString =
        await issueRefreshToken(user._id);

        // 4. Keep only the 5 newest sessions

        await enforceSessionLimit(user._id);
        
        // 5. Store tokens in HTTP-only cookies

        res.cookie(
            "accessToken",
            accessToken,
            ACCESS_COOKIE_OPTIONS,
        );

        res.cookie(
            "refreshToken",
            refreshTokenString,
            REFRESH_COOKIE_OPTIONS,
        );

        // 6. Respond with safe user data

        res.status(200).json({
            message: "Logged in",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// REFRESH CONTROLLER
// ==============================

export const refresh: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        // 1. Read refresh token from the cookie

        const oldRefreshToken =
        req.cookies?.refreshToken;
        
        if (!oldRefreshToken) {
            throw new HttpError(
                401,
                "No refresh token provided",
            );
        }

        // 2. Hash incoming token and find its DB record

        const existing =
        await RefreshToken.findOne({
            tokenHash:
            hashToken(oldRefreshToken),
        });
        
        if (!existing) {
            throw new HttpError(
                401,
                "Invalid refresh token",
            );
        }

        // 3. Refresh-token reuse detection
        // If a previously revoked token is reused,
        // revoke all sessions for that user

        if (existing.revokedAt) {
            await RefreshToken.deleteMany({
                userId: existing.userId,
            });
            
            res.clearCookie(
                "accessToken",
                ACCESS_COOKIE_OPTIONS,
            );
            
            res.clearCookie(
                "refreshToken",
                REFRESH_COOKIE_OPTIONS,
            );
            
            throw new HttpError(
                401,
                "Session revoked. Please log in again",
            );
        }

        // 4. Explicit expiration check

        if (
            existing.expireAt &&
            existing.expireAt.getTime() <= Date.now()
        ) {
            await RefreshToken.deleteOne({
                _id: existing._id,
            });
            
            throw new HttpError(
                401,
                "Refresh token expired",
            );
        }

        // 5. Find the user associated with the token

        const user = await User.findById(
            existing.userId,
        );
        
        if (!user) {
            throw new HttpError(
                401,
                "Invalid session",
            );
        }
        
        // 6. Rotate refresh token:
        // mark old token as revoked

        existing.revokedAt = new Date();
        
        await existing.save();

        // 7. Generate a new token pair

        const newAccessToken =
        createAccessToken({
            userId: user._id.toString(),
            roles: user.roles,
        });

        const newRefreshToken =
        await issueRefreshToken(user._id);

        // 8. Store new tokens in cookies

        res.cookie(
            "accessToken",
            newAccessToken,
            ACCESS_COOKIE_OPTIONS,
        );

        res.cookie(
            "refreshToken",
            newRefreshToken,
            REFRESH_COOKIE_OPTIONS,
        );

        res.status(200).json({
            message: "Tokens refreshed",
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// LOGOUT CONTROLLER
// ==============================

export const logout: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        // 1. Read refresh token from the cookie

        const refreshTokenCookie =
        req.cookies?.refreshToken;

        // 2. Remove its DB record if it exists

        if (refreshTokenCookie) {
            await RefreshToken.deleteOne({
                tokenHash: hashToken(
                    refreshTokenCookie,
                ),
            });
        }

        // 3. Clear authentication cookies

        res.clearCookie(
            "accessToken",
            ACCESS_COOKIE_OPTIONS,
        );

        res.clearCookie(
            "refreshToken",
            REFRESH_COOKIE_OPTIONS,
        );

        // 4. Respond

        res.status(200).json({
            message:
            "Successfully logged out",
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// ME CONTROLLER
// ==============================

export const me: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        // 1. authenticate middleware already verified
        // the JWT and attached its payload to req.user

        const { userId } = req.user!;

        // 2. Fetch the current user

        const user = await User.findById(
            userId,
        ).lean();
        
        if (!user) {
            throw new HttpError(
                404,
                "User not found",
            );
        }

        // 3. Return safe user data

        res.status(200).json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
        });
    } catch (error) {
        next(error);
    }
};