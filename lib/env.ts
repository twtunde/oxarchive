import { z } from "zod"

// Empty-string env vars (a common ".env placeholder left blank" pattern) should
// be treated as unset rather than failing min-length/email validation.
function optional<T extends z.ZodType>(schema: T) {
    return z.preprocess((value) => (value === "" ? undefined : value), schema.optional())
}

const envSchema = z.object({
    DATABASE_URL: z.url(),
    UPSTASH_REDIS_REST_URL: optional(z.url()),
    UPSTASH_REDIS_REST_TOKEN: optional(z.string().min(1)),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    ADMIN_SECRET: z.string().min(8),
    RESEND_API_KEY: optional(z.string().min(1)),
    RESEND_FROM_EMAIL: optional(z.string().min(1)),
    ADMIN_NOTIFICATION_EMAIL: optional(z.email()),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    throw new Error(
        `Invalid environment configuration: ${JSON.stringify(z.flattenError(parsed.error).fieldErrors)}`,
    )
}

export const env = parsed.data
