import z from "zod";

export const updateMemberPreferencesSchema = z
    .object({
        musicPreference: z
            .string()
            .trim()
            .max(100)
            .nullable()
            .optional(),

        quieterSession: z
            .boolean()
            .optional(),
    })
    .strict();