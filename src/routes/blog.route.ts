import { Router } from "express";

import {
    getBlogPosts,
    getBlogPostBySlug,
    createBlogPost,
    updateBlogPost,
} from "../controllers/blog.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateBodyZod } from "../middleware/validateBodyZod.js";

import {
    createBlogPostSchema,
    updateBlogPostSchema,
} from "../schemas/blog.schemas.js";

const blogRouter = Router();

// ==============================
// PUBLIC ROUTES
// ==============================

blogRouter.get("/", getBlogPosts);

blogRouter.get("/:slug", getBlogPostBySlug);

// ==============================
// ADMIN ROUTES
// ==============================

blogRouter.post(
    "/",
    authenticate,
    authorize("admin"),
    validateBodyZod(createBlogPostSchema),
    createBlogPost,
);

blogRouter.put(
    "/:id",
    authenticate,
    authorize("admin"),
    validateBodyZod(updateBlogPostSchema),
    updateBlogPost,
);

export default blogRouter;