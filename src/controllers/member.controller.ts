import type { RequestHandler } from "express";
import z from "zod";

import User from "../models/User.js";
import { updateMemberPreferencesSchema } from "../schemas/member.schemas.js";
import { HttpError } from "../utils/httpError.js";

type UpdateMemberPreferencesBody = z.infer<
    typeof updateMemberPreferencesSchema
>;

// ==============================
// GET MY MEMBER PROFILE
// ==============================

export const getMyMemberProfile: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
            throw new HttpError(
                401,
                "Not Authenticated",
            );
        }
        
        const user = await User.findById(userId).lean();
        
        if (!user) {
            throw new HttpError(
                404,
                "User not found",
            );
        }
        
        res.status(200).json({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            preferences: user.preferences,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// UPDATE MY PREFERENCES
// ==============================

export const updateMyPreferences: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const userId = req.user?.userId;
        const body =
            req.body as UpdateMemberPreferencesBody;

        if (!userId) {
            throw new HttpError(
                401,
                "Not Authenticated",
            );
        }

        const update: Record<string, unknown> = {};

        if (body.musicPreference !== undefined) {
            update["preferences.musicPreference"] =
                body.musicPreference;
        }

        if (body.quieterSession !== undefined) {
            update["preferences.quieterSession"] =
                body.quieterSession;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: update,
            },
            {
                returnDocument: "after",
                runValidators: true,
            },
        );

        if (!user) {
            throw new HttpError(
                404,
                "User not found",
            );
        }

        res.status(200).json({
            message: "Preferences updated",
            preferences: user.preferences,
        });
    } catch (error) {
        next(error);
    }
};