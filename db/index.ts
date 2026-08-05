import "server-only"

import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"

import { env } from "@/lib/env"
import * as schema from "@/db/schema"

const globalForDb = globalThis as unknown as {
    pool?: Pool
}

const pool =
    globalForDb.pool ??
    new Pool({
        connectionString: env.DATABASE_URL,
        max: 10,
    })

if (env.NODE_ENV !== "production") {
    globalForDb.pool = pool
}

export const db = drizzle({
    client: pool,
    schema,
})
