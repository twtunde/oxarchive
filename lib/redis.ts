import "server-only"

import { randomUUID } from "node:crypto"

import { Redis } from "@upstash/redis"

import { env } from "@/lib/env"

const globalForRedis = globalThis as unknown as {
    redis?: Redis
}

function toUpstashRestUrl(rawUrl: string): string {
    const value = rawUrl.trim()

    if (value.startsWith("https://")) {
        return value
    }

    if (value.startsWith("rediss://") || value.startsWith("redis://")) {
        const parsed = new URL(value)
        const path = parsed.pathname === "/" ? "" : parsed.pathname
        return `https://${parsed.hostname}${path}`
    }

    return value
}

function createRedisClient() {
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        const restUrl = toUpstashRestUrl(env.UPSTASH_REDIS_REST_URL)

        return new Redis({
            url: restUrl,
            token: env.UPSTASH_REDIS_REST_TOKEN,
        })
    }

    return undefined
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (env.NODE_ENV !== "production" && redis) {
    globalForRedis.redis = redis
}

export async function withRedis<T>(operation: (client: Redis) => Promise<T>): Promise<T | null> {
    if (!redis) {
        return null
    }

    try {
        return await operation(redis)
    } catch {
        return null
    }
}

export async function invalidateCatalogCache() {
    await withRedis(async (client) => {
        const keys = await client.keys("catalog:ebooks:*")

        for (const key of keys) {
            await client.del(key)
        }
    })
}

export type RedisHealthStatus = {
    configured: boolean
    available: boolean
    latencyMs: number | null
    cacheRoundTripOk: boolean
    catalogCacheKeyCount: number
    error?: string
}

/**
 * Runs a lightweight Redis health check:
 * - connectivity (PING)
 * - basic cache behavior (SET/GET/DEL)
 * - catalog cache key visibility
 */
export async function getRedisHealthStatus(): Promise<RedisHealthStatus> {
    if (!redis) {
        return {
            configured: false,
            available: false,
            latencyMs: null,
            cacheRoundTripOk: false,
            catalogCacheKeyCount: 0,
            error: "Upstash Redis is not configured.",
        }
    }

    try {
        const startedAt = Date.now()
        const pingResult = await redis.ping()
        const latencyMs = Date.now() - startedAt

        if (pingResult !== "PONG") {
            return {
                configured: true,
                available: false,
                latencyMs,
                cacheRoundTripOk: false,
                catalogCacheKeyCount: 0,
                error: `Unexpected ping response: ${pingResult}`,
            }
        }

        const probeKey = `health:redis:probe:${randomUUID()}`
        const probeValue = randomUUID()

        await redis.set(probeKey, probeValue, { ex: 30 })
        const roundTripValue = await redis.get<string>(probeKey)
        await redis.del(probeKey)

        const cacheRoundTripOk = roundTripValue === probeValue
        const catalogCacheKeys = await redis.keys("catalog:ebooks:*")

        return {
            configured: true,
            available: true,
            latencyMs,
            cacheRoundTripOk,
            catalogCacheKeyCount: catalogCacheKeys.length,
            ...(cacheRoundTripOk ? {} : { error: "SET/GET probe did not round-trip correctly." }),
        }
    } catch (error) {
        return {
            configured: true,
            available: false,
            latencyMs: null,
            cacheRoundTripOk: false,
            catalogCacheKeyCount: 0,
            error: error instanceof Error ? error.message : "Unknown Redis error.",
        }
    }
}
