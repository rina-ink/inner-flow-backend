import type { RequestHandler } from "express";
import z from "zod";

import Availability from "../models/Availability.js";
import { createAvailabilitySchema } from "../schemas/availability.schemas.js";
import { HttpError } from "../utils/httpError.js";

type CreateAvailabilityBody = z.infer<
    typeof createAvailabilitySchema
>;

// ==============================
// GET ALL AVAILABILITY
// ==============================

export const getAvailability: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        const availability = await Availability.find()
        .sort({
            type: 1,
            dayOfWeek: 1,
            date: 1,
        })
        .lean();
        
        res.status(200).json({
            results: availability,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// GET AVAILABILITY BY DATE
// ==============================

export const getAvailabilityByDate: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const date = req.params.date;

        if (typeof date !== "string") {
            throw new HttpError(
                400,
                "Invalid date",
            );
        }

        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new HttpError(
                400,
                "Invalid date",
            );
        }

        const dayOfWeek = parsedDate.getDay();

        // First check whether this particular date
        // has an exception
        const exception = await Availability.findOne({
            type: "exception",
            date,
        }).lean();

        // An exception overrides the normal weekly schedule
        if (exception) {
            return res.status(200).json({
                date,
                source: "exception",
                isAvailable: exception.isAvailable,
                startTime: exception.startTime,
                endTime: exception.endTime,
            });
        }

        // No exception - use the normal weekly schedule
        const weekly = await Availability.findOne({
            type: "weekly",
            dayOfWeek,
        }).lean();

        if (!weekly) {
            throw new HttpError(
                404,
                "No availability configured for this day",
            );
        }

        res.status(200).json({
            date,
            source: "weekly",
            isAvailable: weekly.isAvailable,
            startTime: weekly.startTime,
            endTime: weekly.endTime,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// CREATE AVAILABILITY
// ==============================

export const createAvailability: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const body = req.body as CreateAvailabilityBody;
        
        if (body.type === "weekly") {
            const existing = await Availability.findOne({
                type: "weekly",
                dayOfWeek: body.dayOfWeek,
            }).lean();
            
            if (existing) {
                throw new HttpError(
                    409,
                    "Weekly availability for this day already exists",
                );
            }
        }
        
        if (body.type === "exception") {
            const existing = await Availability.findOne({
                type: "exception",
                date: body.date,
            }).lean();
            
            if (existing) {
                throw new HttpError(
                    409,
                    "Availability exception for this date already exists",
                );
            }
        }

        let availability;
        
        if (body.type === "weekly") {
            availability = await Availability.create({
                type: body.type,
                dayOfWeek: body.dayOfWeek,
                isAvailable: body.isAvailable,
                ...(body.startTime && {
                    startTime: body.startTime,
                }),
                ...(body.endTime && {
                    endTime: body.endTime,
                }),
            });
        }
        
        if (body.type === "exception") {
            availability = await Availability.create({
                type: body.type,
                date: body.date,
                isAvailable: body.isAvailable,
                ...(body.startTime && {
                    startTime: body.startTime,
                }),
                ...(body.endTime && {
                    endTime: body.endTime,
                }),
            });
        }
        
        res.status(201).json({
            message: "Availability created",
            availability,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// UPDATE AVAILABILITY
// ==============================

export const updateAvailability: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { id } = req.params;
        
        const availability =
            await Availability.findByIdAndUpdate(
                id,
                req.body,
                {
                    returnDocument: "after",
                    runValidators: true,
                },
            );
            
            if (!availability) {
                throw new HttpError(
                    404,
                    "Availability not found",
                );
            }
            
            res.status(200).json({
                message: "Availability updated",
                availability,
            });
        } catch (error) {
            next(error);
        }
    };

// ==============================
// DELETE AVAILABILITY
// ==============================

export const deleteAvailability: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { id } = req.params;
        
        const availability =
            await Availability.findByIdAndDelete(id);
            
            if (!availability) {
                throw new HttpError(
                    404,
                    "Availability not found",
                );
            }
            
            res.status(200).json({
                message: "Availability deleted",
            });
        } catch (error) {
            next(error);
        }
    };