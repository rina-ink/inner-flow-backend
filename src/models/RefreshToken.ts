import { Schema, model, Types } from "mongoose";
import { REFRESH_TOKEN_TTL } from "../config.js";

const refreshTokenSchema = new Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
        expireAt: {
            type: Date,
            default: () =>
                new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false,
    },
);

refreshTokenSchema.index(
    { expireAt: 1 },
    { expireAfterSeconds: 0 },
);

refreshTokenSchema.index({ userId: 1 });

const RefreshToken = model(
    "RefreshToken",
    refreshTokenSchema,
);

export default RefreshToken;