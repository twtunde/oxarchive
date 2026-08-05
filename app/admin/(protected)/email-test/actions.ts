"use server"

import { headers } from "next/headers"
import { z } from "zod"

import {
    sendPaymentConfirmedEmail,
    sendTransferClaimedAlert,
} from "@/lib/email"

const buyerEmailSchema = z.object({
    buyerEmail: z.email("Enter a valid recipient email."),
    buyerName: z.string().trim().min(2).max(120).default("Test Buyer"),
})

export type TestEmailState = {
    status: "idle" | "success" | "error"
    message?: string
}

function getBaseUrlFromHeaders(headersList: Headers): string {
    const forwardedProto = headersList.get("x-forwarded-proto")
    const forwardedHost = headersList.get("x-forwarded-host")
    const host = forwardedHost ?? headersList.get("host") ?? "localhost:3000"
    const protocol = forwardedProto ?? (host.includes("localhost") ? "http" : "https")

    return `${protocol}://${host}`
}

export async function sendAdminAlertTestAction(
    prevState: TestEmailState,
): Promise<TestEmailState> {
    void prevState

    try {
        const headersList = await headers()
        const baseUrl = getBaseUrlFromHeaders(headersList)

        await sendTransferClaimedAlert({
            orderToken: "TEST-ADMIN-ALERT-001",
            buyerName: "Test Buyer",
            buyerEmail: "buyer@example.com",
            totalAmountInKobo: 1500000,
            currency: "NGN",
            itemTitles: ["Systems Design at Scale", "MLOps: Shipping Models Reliably"],
            verifyUrl: `${baseUrl}/admin/orders?orderToken=TEST-ADMIN-ALERT-001`,
        })

        return {
            status: "success",
            message: "Admin alert test email sent successfully.",
        }
    } catch (error) {
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to send admin alert test email.",
        }
    }
}

export async function sendBuyerConfirmationTestAction(
    _prevState: TestEmailState,
    formData: FormData,
): Promise<TestEmailState> {
    const parsed = buyerEmailSchema.safeParse({
        buyerEmail: formData.get("buyerEmail"),
        buyerName: formData.get("buyerName") ?? "Test Buyer",
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: parsed.error.issues[0]?.message ?? "Invalid email input.",
        }
    }

    try {
        const headersList = await headers()
        const baseUrl = getBaseUrlFromHeaders(headersList)

        await sendPaymentConfirmedEmail({
            orderToken: "TEST-PAYMENT-CONFIRMED-001",
            buyerName: parsed.data.buyerName,
            buyerEmail: parsed.data.buyerEmail,
            totalAmountInKobo: 2200000,
            currency: "NGN",
            itemTitles: ["Corporate Finance Essentials", "Design Systems That Scale"],
            checkoutUrl: `${baseUrl}/checkout/TEST-PAYMENT-CONFIRMED-001`,
        })

        return {
            status: "success",
            message: `Buyer confirmation test email sent to ${parsed.data.buyerEmail}.`,
        }
    } catch (error) {
        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to send buyer confirmation test email.",
        }
    }
}
