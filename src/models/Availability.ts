import { Schema, model } from "mongoose";

const availabilitySchema = new Schema(
    {
        type: {
            type: String,
            enum: ["weekly", "exception"],
            required: true,
        },

        dayOfWeek: {
            type: Number,
            min: 0,
            max: 6,
        },

        date: {
            type: String,
        },

        isAvailable: {
            type: Boolean,
            required: true,
        },

        startTime: {
            type: String,
        },

        endTime: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Availability = model(
    "Availability",
    availabilitySchema,
);

export default Availability;