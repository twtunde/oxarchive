import { describe, expect, it } from "vitest"

import {
    PLATFORM_FEE_PERCENT,
    calculatePublisherEarnings,
    payoutMonthFromDate,
} from "@/lib/publisher-pricing"

describe("publisher pricing", () => {
    it("enforces 15% platform fee and 85% publisher net", () => {
        const result = calculatePublisherEarnings(100_000)

        expect(PLATFORM_FEE_PERCENT).toBe(15)
        expect(result.platformFeeInKobo).toBe(15_000)
        expect(result.publisherNetInKobo).toBe(85_000)
    })

    it("rounds down fractional fee amounts", () => {
        const result = calculatePublisherEarnings(999)

        expect(result.platformFeeInKobo).toBe(149)
        expect(result.publisherNetInKobo).toBe(850)
    })

    it("throws on invalid gross sale amount", () => {
        expect(() => calculatePublisherEarnings(0)).toThrow()
        expect(() => calculatePublisherEarnings(-100)).toThrow()
        expect(() => calculatePublisherEarnings(19.5)).toThrow()
    })

    it("formats payout month as YYYY-MM in UTC", () => {
        const month = payoutMonthFromDate(new Date("2026-08-07T13:24:00Z"))
        expect(month).toBe("2026-08")
    })
})
