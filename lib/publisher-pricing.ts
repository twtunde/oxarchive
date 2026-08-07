export const PLATFORM_FEE_PERCENT = 15

export function calculatePublisherEarnings(grossSaleInKobo: number) {
    if (!Number.isInteger(grossSaleInKobo) || grossSaleInKobo <= 0) {
        throw new Error("Gross sale amount must be a positive integer in kobo.")
    }

    const platformFeeInKobo = Math.floor((grossSaleInKobo * PLATFORM_FEE_PERCENT) / 100)
    const publisherNetInKobo = grossSaleInKobo - platformFeeInKobo

    return {
        grossSaleInKobo,
        platformFeeInKobo,
        publisherNetInKobo,
    }
}

export function payoutMonthFromDate(date: Date) {
    const year = date.getUTCFullYear()
    const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
    return `${year}-${month}`
}