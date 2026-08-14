import z from "zod";

const durationSchema = z
    .number()
    .int()
    .positive();

const priceSchema = z
    .number()
    .nonnegative();

export const createMassageSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2)
            .max(100),

        slug: z
            .string()
            .trim()
            .toLowerCase()
            .min(2)
            .max(100)
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
                error:
                    "Slug must contain lowercase letters, numbers, and hyphens only",
            }),

        shortDescription: z
            .string()
            .trim()
            .min(10)
            .max(250),

        description: z
            .string()
            .trim()
            .min(20),

        durationOptions: z
            .array(durationSchema)
            .min(1),

        prices: z.record(
            z.string(),
            priceSchema,
        ),

        focus: z
            .array(
                z
                    .string()
                    .trim()
                    .min(1),
            )
            .default([]),

        illustrationKey: z
            .string()
            .trim()
            .min(1),

        isActive: z
            .boolean()
            .default(true),
    })
    .strict();

export const updateMassageSchema =
    createMassageSchema.partial().strict();