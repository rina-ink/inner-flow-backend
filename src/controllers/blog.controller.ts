import type { RequestHandler } from "express";
import z from "zod";

import {
    createBlogPostSchema,
    updateBlogPostSchema,
} from "../schemas/blog.schemas.js";

import BlogPost from "../models/BlogPost.js";
import { HttpError } from "../utils/httpError.js";

// ==============================
// TYPES
// ==============================

type CreateBlogPostBody = z.infer<
    typeof createBlogPostSchema
>;

type UpdateBlogPostBody = z.infer<
    typeof updateBlogPostSchema
>;

// ==============================
// GET ALL PUBLISHED BLOG POSTS
// ==============================

export const getBlogPosts: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        const posts = await BlogPost.find({
            status: "published",
        })
            .select(
                "title slug excerpt category tags illustrationKey publishedAt",
            )
            .sort({
                publishedAt: -1,
                createdAt: -1,
            })
            .lean();
            
        res.status(200).json({
            results: posts,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// GET ONE PUBLISHED BLOG POST BY SLUG
// ==============================

export const getBlogPostBySlug: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const slug = req.params.slug;
        
        if (typeof slug !== "string") {
            throw new HttpError(
                400,
                "Invalid blog post slug",
            );
        }
        
        const post = await BlogPost.findOne({
            slug,
            status: "published",
        }).lean();
        
        if (!post) {
            throw new HttpError(
                404,
                "Blog post not found",
            );
        }
        
        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

// ==============================
// CREATE BLOG POST
// ==============================

export const createBlogPost: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const body = req.body as CreateBlogPostBody;
        
        const existing = await BlogPost.findOne({
            slug: body.slug,
        }).lean();
        
        if (existing) {
            throw new HttpError(
                409,
                "Blog post with this slug already exists",
            );
        }
        
        const post = await BlogPost.create({
            title: body.title,
            slug: body.slug,
            excerpt: body.excerpt,
            content: body.content,
            category: body.category,
            tags: body.tags,
            status: body.status,

            ...(body.illustrationKey && {
                illustrationKey: body.illustrationKey,
            }),

            publishedAt:
                body.status === "published"
                ? body.publishedAt ?? new Date()
                : null,
        });

        
        res.status(201).json({
            message: "Blog post created",
            post,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// UPDATE BLOG POST
// ==============================

export const updateBlogPost: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { id } = req.params;
        const body = req.body as UpdateBlogPostBody;

        const post = await BlogPost.findById(id);
        
        if (!post) {
            throw new HttpError(
                404,
                "Blog post not found",
            );
        }

        // If the slug is being changed, make sure
        // another post does not already use it
        if (
            body.slug &&
            body.slug !== post.slug
        ) {
            const existing = await BlogPost.findOne({
                slug: body.slug,
                _id: { $ne: post._id },
            }).lean();
            
            if (existing) {
                throw new HttpError(
                    409,
                    "Blog post with this slug already exists",
                );
            }
        }

        // If a draft is being published for the first time,
        // automatically set its publication date
        if (
            body.status === "published" &&
            post.status !== "published" &&
            !post.publishedAt
        ) {
            post.publishedAt =
            body.publishedAt ?? new Date();
        }

       // If it is changed back to a draft,
       // remove the publication date.
        if (body.status === "draft") {
            post.publishedAt = null;
        }

        if (body.title !== undefined) {
            post.title = body.title;
        }

        if (body.slug !== undefined) {
            post.slug = body.slug;
        }

        if (body.excerpt !== undefined) {
            post.excerpt = body.excerpt;
        }

        if (body.content !== undefined) {
            post.content = body.content;
        }

        if (body.category !== undefined) {
            post.category = body.category;
        }

        if (body.tags !== undefined) {
            post.tags = body.tags;
        }

        if (body.illustrationKey !== undefined) {
            post.illustrationKey =
            body.illustrationKey;
        }

        if (body.status !== undefined) {
            post.status = body.status;
        }
        
        await post.save();

        res.status(200).json({
            message: "Blog post updated",
            post,
        });
    } catch (error) {
        next(error);
    }
};