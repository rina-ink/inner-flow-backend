import { Router } from "express";

import {
    getMyMemberProfile,
    updateMyPreferences,
} from "../controllers/member.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { validateBodyZod } from "../middleware/validateBodyZod.js";
import { updateMemberPreferencesSchema } from "../schemas/member.schemas.js";

const memberRouter = Router();

memberRouter.get(
    "/me",
    authenticate,
    getMyMemberProfile,
);

memberRouter.patch(
    "/me/preferences",
    authenticate,
    validateBodyZod(updateMemberPreferencesSchema),
    updateMyPreferences,
);

export default memberRouter;