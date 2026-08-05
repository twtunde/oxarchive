import "server-only"

import { createHash, timingSafeEqual } from "node:crypto"

import { env } from "@/lib/env"

export const ADMIN_SESSION_COOKIE = "admin_session"

export function hashAdminSecret() {
    return createHash("sha256").update(env.ADMIN_SECRET).digest("hex")
}

export function verifyAdminSession(cookieValue: string | undefined) {
    if (!cookieValue) {
        return false
    }

    const expected = Buffer.from(hashAdminSecret(), "hex")
    const actual = Buffer.from(cookieValue, "hex")

    if (expected.length !== actual.length) {
        return false
    }

    return timingSafeEqual(expected, actual)
}

export function verifyAdminSecret(submitted: string) {
    const expected = Buffer.from(hashAdminSecret(), "hex")
    const actual = Buffer.from(createHash("sha256").update(submitted).digest("hex"), "hex")

    return timingSafeEqual(expected, actual)
}
