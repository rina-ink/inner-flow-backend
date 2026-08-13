import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            trim: true,
            maxLength: 50,
        },
        
        lastName: {
            type: String,
            trim: true,
            maxLength: 50,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        roles: {
            type: [String],
            default: ["user"],
        },
        
        preferences: {
            musicPreference: {
                type: String,
                trim: true,
                default: null,
            },

            quieterSession: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false,
        },
        
        versionKey: false,

        toJSON: {
            transform(_doc, ret: any) {
            delete ret.password;
            return ret;
            },
        },
    },
);

const User = model("User", userSchema);

export default User;