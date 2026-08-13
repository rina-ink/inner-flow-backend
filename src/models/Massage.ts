import { Schema, model } from "mongoose";

const massageSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        shortDescription: {
            type: String,
            required: true,
            trim: true,
            maxLength: 250,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        durationOptions: {
            type: [Number],
            required: true,
        },

        prices: {
            type: Map,
            of: Number,
            required: true,
        },

        focus: {
        type: [String],
        default: [],
        },

        illustrationKey: {
            type: String,
            required: true,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Massage = model("Massage", massageSchema);

export default Massage;