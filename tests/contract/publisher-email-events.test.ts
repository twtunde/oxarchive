/** @vitest-environment node */

import { beforeEach, describe, expect, it, vi } from "vitest"

const sendMock = vi.fn().mockResolvedValue({ data: { id: "email_123" } })

vi.mock("server-only", () => ({}))

vi.mock("resend", () => {
    class MockResend {
        emails = {
            send: sendMock,
        }
    }

    return {
        Resend: MockResend,
    }
})

vi.mock("@/lib/env", () => ({
    env: {
        DATABASE_URL: "postgresql://db",
        CLOUDINARY_CLOUD_NAME: "cloud",
        CLOUDINARY_API_KEY: "key",
        CLOUDINARY_API_SECRET: "secret",
        ADMIN_SECRET: "supersecret",
        NODE_ENV: "test",
        RESEND_API_KEY: "resend-key",
        RESEND_FROM_EMAIL: "Oxarchive <noreply@example.com>",
        ADMIN_NOTIFICATION_EMAIL: "admin@example.com",
        UPSTASH_REDIS_REST_URL: undefined,
        UPSTASH_REDIS_REST_TOKEN: undefined,
    },
}))

describe("publisher email events", () => {
    beforeEach(() => {
        sendMock.mockClear()
    })

    it("sends submission-received email", async () => {
        const { sendPublisherSubmissionReceivedEmail } = await import("@/lib/email")

        await sendPublisherSubmissionReceivedEmail({
            pseudonym: "Night Scribe",
            title: "Signals in Rust",
            contactEmail: "scribe@example.com",
        })

        expect(sendMock).toHaveBeenCalledTimes(1)
        const payload = sendMock.mock.calls[0]?.[0] as { subject: string; to: string }
        expect(payload.subject).toContain("Submission received")
        expect(payload.to).toBe("scribe@example.com")
    })

    it("sends approved listing email", async () => {
        const { sendPublisherSubmissionApprovedEmail } = await import("@/lib/email")

        await sendPublisherSubmissionApprovedEmail({
            pseudonym: "Night Scribe",
            title: "Signals in Rust",
            contactEmail: "scribe@example.com",
            listingUrl: "https://example.com/ebooks/signals-in-rust",
            suggestedPriceInKobo: 250000,
            finalPriceInKobo: 240000,
            currency: "NGN",
        })

        expect(sendMock).toHaveBeenCalledTimes(1)
        const payload = sendMock.mock.calls[0]?.[0] as { subject: string }
        expect(payload.subject).toContain("Approved and listed")
    })
})
