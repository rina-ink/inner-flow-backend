import { Schema, model } from "mongoose";

const blogPostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        excerpt: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        
        tags: {
            type: [String],
            default: [],
        },

        illustrationKey: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        },

        publishedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

const BlogPost = model(
    "BlogPost",
    blogPostSchema,
);

export default BlogPost;