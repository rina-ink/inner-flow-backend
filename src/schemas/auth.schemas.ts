import z from "zod";

// ===========================
// Reusable building blocks
// ===========================

const emailSchema = z.email({ error: "Please provide a valid email" });
const basePasswordSchema = z
    .string({ error: "Password must be a string" })
    .min(12, { error: "Password must be at least 12 chars" })
    .max(72, { error: "Password cannot be longer than 72 chars" });

// ===========================
// Register schema
// ===========================
export const registerSchema = z
    .object(
        {
            email: emailSchema,
            password: basePasswordSchema
                .regex(/[a-z]/, {
                    error: "password must include at least one lowercase letter",
                })
                .regex(/[A-Z]/, {
                    error: "password must include at least one uppercase letter",
                })
                .regex(/[0-9]/, {
                    error: "password must include at least one number",
                })
                .regex(/[^a-zA-Z0-9]/, {
                    error: "password must include at least one special character",
                }),
            confirmPassword: z.string(),
            firstName: z.string().min(1).max(50).optional(),
            lastName: z.string().min(1).max(50).optional(),
        },
        {
            error: "Please provide a valid email and a secure password",
        },
    )
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
        error: "Passwords do not match",
    });

// ===========================
// Login schema
// ===========================
export const loginSchema = z
    .object({
        email: emailSchema,
        password: basePasswordSchema,
    })
    .strict();