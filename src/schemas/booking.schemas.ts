import z from "zod";

const objectIdSchema = z
    .string()
    .regex(/^[a-f\d]{24}$/i, {
        error: "Invalid MongoDB ObjectId",
    });

const timeSchema = z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        error: "Time must be in HH:MM format",
    });

const contactSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1)
        .max(50),

    lastName: z
        .string()
        .trim()
        .min(1)
        .max(50),

    email: z
        .email({
            error: "Please provide a valid email",
        }),

    phone: z
        .string()
        .trim()
        .min(5)
        .max(30)
        .optional(),
});

export const createBookingSchema = z
    .object({
        contact: contactSchema,

        massageId: objectIdSchema,

        date: z
            .iso
            .date()
            .refine(
                (date) => {
                    const today = new Date();
                    const requestedDate = new Date(`${date}T00:00:00`);
                    
                    today.setHours(0, 0, 0, 0);
                    
                    return requestedDate >= today;
                },
                {
                    error: "Booking date cannot be in the past",
                },
            ),

        startTime: timeSchema,

        duration: z
            .number()
            .int()
            .positive(),

        musicPreference: z
            .string()
            .trim()
            .max(100)
            .optional(),

        notes: z
            .string()
            .trim()
            .max(1000)
            .optional(),
    })
    .strict();