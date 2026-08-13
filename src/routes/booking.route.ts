import { Router } from "express";

import {
    createBooking,
    getBookings,
    getMyBookings,
    cancelBooking,
} from "../controllers/booking.controller.js";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate.js";
import { validateBodyZod } from "../middleware/validateBodyZod.js";
import { createBookingSchema } from "../schemas/booking.schemas.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const bookingRouter = Router();

bookingRouter.post(
    "/",
    optionalAuthenticate,
    validateBodyZod(createBookingSchema),
    createBooking,
);

bookingRouter.get(
    "/",
    authenticate,
    authorize("admin"),
    getBookings,
);

bookingRouter.get(
    "/me",
    authenticate,
    getMyBookings,
);

bookingRouter.patch(
    "/:id/cancel",
    authenticate,
    cancelBooking,
);

export default bookingRouter;