import type { RequestHandler } from "express";
import z from "zod";

import Booking from "../models/Booking.js";
import Massage from "../models/Massage.js";
import Availability from "../models/Availability.js";

import { createBookingSchema } from "../schemas/booking.schemas.js";
import { HttpError } from "../utils/httpError.js";

type CreateBookingBody = z.infer<
    typeof createBookingSchema
>;

// --------------------------------
// TIME HELPERS
// --------------------------------

const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time
        .split(":")
        .map(Number);
        
    return hours! * 60 + minutes!;
};

// ==============================
// CREATE BOOKING
// ==============================

export const createBooking: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const body = req.body as CreateBookingBody;

        const {
            contact,
            massageId,
            date,
            startTime,
            duration,
            musicPreference,
            notes,
        } = body;

        // 1. Check that the massage exists
        // and is currently available to clients

        const massage = await Massage.findOne({
            _id: massageId,
            isActive: true,
        }).lean();

        if (!massage) {
            throw new HttpError(
                404,
                "Massage not found",
            );
        }

        // 2. Check that the requested duration
        // is actually offered for this massage

        if (
            !massage.durationOptions.includes(duration)
        ) {
            throw new HttpError(
                400,
                "This duration is not available for the selected massage",
            );
        }

        // 3. Determine the effective availability
        // for the requested date

        const parsedDate = new Date(
            `${date}T00:00:00`,
        );

        const dayOfWeek = parsedDate.getDay();

        const exception =
            await Availability.findOne({
                type: "exception",
                date,
            }).lean();

        const availability =
            exception ??
            (await Availability.findOne({
                type: "weekly",
                dayOfWeek,
            }).lean());

        if (
            !availability ||
            !availability.isAvailable
        ) {
            throw new HttpError(
                400,
                "This date is not available for booking",
            );
        }

        if (
            !availability.startTime ||
            !availability.endTime
        ) {
            throw new HttpError(
                400,
                "Availability hours are not configured for this date",
            );
        }

        // 4. Check that the requested appointment
        // fits inside the working hours

        const requestedStart =
            timeToMinutes(startTime);

        const requestedEnd =
            requestedStart + duration;

        const availableStart =
            timeToMinutes(
                availability.startTime,
            );

        const availableEnd =
        timeToMinutes(
            availability.endTime,
        );
        
        if (
            requestedStart < availableStart ||
            requestedEnd > availableEnd
        ) {
            throw new HttpError(
                400,
                "The requested time is outside available hours",
            );
        }

        // 5. Check existing bookings on this date

        const existingBookings =
            await Booking.find({
                date,
                status: {
                    $ne: "cancelled",
                },
            }).lean();

        const hasConflict =
            existingBookings.some((booking) => {
                const existingStart =
                    timeToMinutes(
                        booking.startTime,
                    );

                const existingEnd =
                existingStart +
                booking.duration;

                return (
                    requestedStart < existingEnd &&
                    requestedEnd > existingStart
                );
            });
            
        if (hasConflict) {
            throw new HttpError(
                409,
                "This time slot is no longer available",
            );
        }

        // 6. Create the booking
        //
        // userId is optional because guest checkout
        // will also use this endpoint

        const booking = await Booking.create({
            userId: req.user?.userId ?? null,
            
            contact: {
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                ...(contact.phone && {
                    phone: contact.phone,
                }),
            },

            massageId,

            date,

            startTime,

            duration,
            
            ...(musicPreference && {
                musicPreference,
            }),

            ...(notes && {
                notes,
            }),
        });

        // 7. Return the created booking

        res.status(201).json({
            message: "Booking confirmed",
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// GET ALL BOOKINGS
// ==============================

export const getBookings: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        const bookings = await Booking.find()
        .populate(
            "massageId",
            "name slug durationOptions",
        )
        .populate(
            "userId",
            "firstName lastName email",
        )
        .sort({
            date: 1,
            startTime: 1,
        })
        .lean();
        
        res.status(200).json({
            results: bookings,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// GET MY BOOKINGS
// ==============================

export const getMyBookings: RequestHandler = async (
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
        
        const bookings = await Booking.find({
            userId,
        })
            .populate(
                "massageId",
                "name slug",
            )
            .sort({
                date: 1,
                startTime: 1,
            })
            .lean();
            
            res.status(200).json({
                results: bookings,
            });
    } catch (error) {
        next(error);
    }
};

// ==============================
// CANCEL BOOKING
// ==============================

export const cancelBooking: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        
        if (!userId) {
            throw new HttpError(
                401,
                "Not Authenticated",
            );
        }
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            throw new HttpError(
                404,
                "Booking not found",
            );
        }

        if (booking.status === "cancelled") {
            throw new HttpError(
                400,
                "Booking is already cancelled",
            );
        }

        const isOwner =
            booking.userId?.toString() === userId;

        const isAdmin =
            req.user?.roles.includes("admin");
            
        if (!isOwner && !isAdmin) {
            throw new HttpError(
                403,
                "You cannot cancel this booking",
            );
        }
        
        booking.status = "cancelled";
        
        await booking.save();
        
        res.status(200).json({
            message: "Booking cancelled",
            booking,
        });
    } catch (error) {
        next(error);
    }
};