import { Router } from "express";

import {
    getAvailability,
    getAvailabilityByDate,
    createAvailability,
    updateAvailability,
    deleteAvailability,
} from "../controllers/availability.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateBodyZod } from "../middleware/validateBodyZod.js";

import { createAvailabilitySchema } from "../schemas/availability.schemas.js";

const availabilityRouter = Router();

// ==============================
// PUBLIC ROUTES
// ==============================

// Visitors can read the schedule
availabilityRouter.get("/", getAvailability);

availabilityRouter.get(
    "/date/:date",
    getAvailabilityByDate,
);

// ==============================
// ADMIN ROUTES
// ==============================

availabilityRouter.post(
    "/",
    authenticate,
    authorize("admin"),
    validateBodyZod(createAvailabilitySchema),
    createAvailability,
);

availabilityRouter.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateAvailability,
);

availabilityRouter.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteAvailability,
);

export default availabilityRouter;