import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Drizzle commands. Run with --env-file=.env")
}

export default defineConfig({
    schema: "./db/schema/index.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    strict: true,
    verbose: true,
})
