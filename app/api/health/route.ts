import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/db"
import { getRedisHealthStatus } from "@/lib/redis"

export const dynamic = "force-dynamic"

type ServiceStatus = {
    available: boolean
    latencyMs: number | null
    error?: string
}

async function getDatabaseHealth(): Promise<ServiceStatus> {
    const startedAt = Date.now()

    try {
        await db.execute(sql`select 1`)

        return {
            available: true,
            latencyMs: Date.now() - startedAt,
        }
    } catch (error) {
        return {
            available: false,
            latencyMs: null,
            error: error instanceof Error ? error.message : "Unknown database error.",
        }
    }
}

export async function GET() {
    const [database, redis] = await Promise.all([
        getDatabaseHealth(),
        getRedisHealthStatus(),
    ])

    const healthy =
        database.available &&
        (!redis.configured || (redis.available && redis.cacheRoundTripOk))

    return NextResponse.json(
        {
            status: healthy ? "ok" : "degraded",
            timestamp: new Date().toISOString(),
            services: {
                database,
                redis,
            },
            checks: {
                redisCachingOperational:
                    redis.configured && redis.available && redis.cacheRoundTripOk,
            },
        },
        { status: healthy ? 200 : 503 }
    )
}
