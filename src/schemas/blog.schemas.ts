import z from "zod";

// ==============================
// CREATE BLOG POST
// ==============================

export const createBlogPostSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters"),

    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Slug must be at least 2 characters"),

    excerpt: z
        .string()
        .trim()
        .min(10, "Excerpt must be at least 10 characters"),

    content: z
        .string()
        .trim()
        .min(20, "Content must be at least 20 characters"),

    category: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "Category must be at least 2 characters"),

    tags: z
        .array(
            z.string().trim().toLowerCase(),
        )
        .default([]),

    illustrationKey: z
        .string()
        .trim()
        .optional(),

    status: z
        .enum(["draft", "published"])
        .default("draft"),

    publishedAt: z
        .coerce
        .date()
        .nullable()
        .optional(),
});

// ==============================
// UPDATE BLOG POST
// ==============================

export const updateBlogPostSchema =
    createBlogPostSchema.partial();