import z from "zod";

const timeSchema = z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        error: "Time must be in HH:MM format",
    });

const weeklyAvailabilitySchema = z
    .object({
        type: z.literal("weekly"),
        
        dayOfWeek: z
            .number()
            .int()
            .min(0)
            .max(6),

        isAvailable: z.boolean(),

        startTime: timeSchema.optional(),
        endTime: timeSchema.optional(),
    })
    .strict()
    .refine(
        (data) =>
            !data.isAvailable ||
            (data.startTime && data.endTime),
        {
            error:
            "Available days must include startTime and endTime",
        },
    );

const exceptionAvailabilitySchema = z
    .object({
        type: z.literal("exception"),

        date: z.iso.date(),

        isAvailable: z.boolean(),

        startTime: timeSchema.optional(),
        endTime: timeSchema.optional(),
    })
    .strict()
    .refine(
        (data) =>
            !data.isAvailable ||
            (data.startTime && data.endTime),
        {
            error:
            "Available exceptions must include startTime and endTime",
        },
    );

export const createAvailabilitySchema =
    z.discriminatedUnion("type", [
        weeklyAvailabilitySchema,
        exceptionAvailabilitySchema,
    ]);