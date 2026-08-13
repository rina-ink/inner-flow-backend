import { Schema, model, Types } from "mongoose";

const bookingSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            default: null,
        },

        contact: {
            firstName: {
                type: String,
                required: true,
                trim: true,
            },
            lastName: {
                type: String,
                required: true,
                trim: true,
            },
            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
            phone: {
                type: String,
                trim: true,
            },
        },
        
        massageId: {
            type: Types.ObjectId,
            ref: "Massage",
            required: true,
        },

        date: {
            type: String,
            required: true,
        },

        startTime: {
            type: String,
            required: true,
        },
        
        duration: {
            type: Number,
            required: true,
        },

        musicPreference: {
            type: String,
            trim: true,
        },
        
        notes: {
            type: String,
            trim: true,
        },
        
        status: {
            type: String,
            enum: [
                "confirmed",
                "cancelled",
                "completed",
            ],
            default: "confirmed",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// useful when checking appointments for a particular day
bookingSchema.index({
    date: 1,
    startTime: 1,
});

bookingSchema.index({
    userId: 1,
    date: 1,
});

const Booking = model(
    "Booking",
    bookingSchema,
);

export default Booking;