import { describe, expect, it } from "vitest"

import { publisherSubmissionSchema } from "@/lib/publisher-submission-schema"

const baseInput = {
    pseudonym: "Night Scribe",
    contactEmail: "scribe@example.com",
    title: "Signals in Rust",
    authorDisplayName: "Night Scribe",
    description: "A deeply technical manuscript for backend engineers in distributed systems.",
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    format: "pdf",
    suggestedPriceInMainUnit: 2500,
    payoutMethod: "bank",
    bankAccountName: "Night Scribe",
    bankAccountNumber: "0123456789",
    bankCodeSwift: "ABNGNGLA",
}

describe("publisherSubmissionSchema", () => {
    it("accepts valid bank payout submissions", () => {
        const result = publisherSubmissionSchema.safeParse(baseInput)
        expect(result.success).toBe(true)
    })

    it("requires payout details for selected payout method", () => {
        const result = publisherSubmissionSchema.safeParse({
            ...baseInput,
            payoutMethod: "paypal",
            bankAccountName: undefined,
            bankAccountNumber: undefined,
            bankCodeSwift: undefined,
            paypalEmail: "",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.path.includes("paypalEmail"))).toBe(true)
        }
    })

    it("requires payoneer email when payoneer is selected", () => {
        const result = publisherSubmissionSchema.safeParse({
            ...baseInput,
            payoutMethod: "payoneer",
            bankAccountName: undefined,
            bankAccountNumber: undefined,
            bankCodeSwift: undefined,
            payoneerEmail: "",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.path.includes("payoneerEmail"))).toBe(true)
        }
    })
})
