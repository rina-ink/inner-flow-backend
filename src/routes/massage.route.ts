import { Router } from "express";

import {
    getMassages,
    getMassageBySlug,
    createMassage,
    updateMassage,
    deleteMassage,
} from "../controllers/massage.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateBodyZod } from "../middleware/validateBodyZod.js";

import {
    createMassageSchema,
    updateMassageSchema,
} from "../schemas/massage.schemas.js";

const massageRouter = Router();

// ==============================
// PUBLIC ROUTES
// ==============================

massageRouter.get("/", getMassages);

massageRouter.get("/:slug", getMassageBySlug);

// ==============================
// ADMIN ROUTES
// ==============================

massageRouter.post(
    "/",
    authenticate,
    authorize("admin"),
    validateBodyZod(createMassageSchema),
    createMassage,
);

massageRouter.put(
    "/:id",
    authenticate,
    authorize("admin"),
    validateBodyZod(updateMassageSchema),
    updateMassage,
);

massageRouter.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteMassage,
);

export default massageRouter;