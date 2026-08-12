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