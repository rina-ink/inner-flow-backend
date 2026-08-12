// src/utils/jwt.ts

import jwt from "jsonwebtoken";
import { ACCESS_JWT_SECRET } from "../config.js";

const ACCESS_TOKEN_EXPIRES_IN = "15min";

export type AccessTokenPayload = {
    userId: string;
    roles: string[];
};

export function createAccessToken(
    payload: AccessTokenPayload,
): string {
    return jwt.sign(payload, ACCESS_JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
}

export function verifyAccessToken(
    token: string,
): AccessTokenPayload {
    return jwt.verify(
        token,
        ACCESS_JWT_SECRET,
    ) as AccessTokenPayload;
}