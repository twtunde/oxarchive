import "server-only"

import { createElement } from "react"
import { Resend } from "resend"

import { PaymentConfirmedEmail, TransferClaimedAlertEmail } from "@/lib/email-templates"
import { env } from "@/lib/env"
import { formatPrice } from "@/lib/format"

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : undefined
const defaultFrom = env.RESEND_FROM_EMAIL ?? "Oxarchive <onboarding@resend.dev>"

type ResendSendResult = Awaited<ReturnType<Resend["emails"]["send"]>>

function assertEmailSent(result: ResendSendResult, context: string) {
    if (result.error) {
        throw new Error(`[email] ${context} failed: ${result.error.message}`)
    }

    if (result.data?.id) {
        console.info(`[email] ${context} sent: ${result.data.id}`)
    }
}

type TransferClaimedAlertInput = {
    orderToken: string
    buyerName: string
    buyerEmail: string
    totalAmountInKobo: number
    currency: string
    itemTitles: string[]
    verifyUrl: string
}

/** Notifies the admin that a buyer clicked "I've made the transfer" — logs and no-ops if Resend isn't configured. */
export async function sendTransferClaimedAlert(input: TransferClaimedAlertInput) {
    if (!resend || !env.ADMIN_NOTIFICATION_EMAIL) {
        console.warn(
            `[email] Skipped transfer-claimed alert for order ${input.orderToken} — RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not configured.`,
        )
        return
    }

    const amount = formatPrice(input.totalAmountInKobo, input.currency)

    const result = await resend.emails.send({
        from: defaultFrom,
        to: env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Transfer claimed — ${input.orderToken} (${amount})`,
        react: createElement(TransferClaimedAlertEmail, {
            orderToken: input.orderToken,
            buyerName: input.buyerName,
            buyerEmail: input.buyerEmail,
            amount,
            itemTitles: input.itemTitles,
            verifyUrl: input.verifyUrl,
        }),
        text: [
            `A buyer says they sent a transfer for order ${input.orderToken}.`,
            `Buyer: ${input.buyerName} (${input.buyerEmail})`,
            `Amount: ${amount}`,
            `Books: ${input.itemTitles.join(", ")}`,
            `Verify now: ${input.verifyUrl}`,
        ].join("\n"),
    })

    assertEmailSent(result, `transfer-claimed alert for ${input.orderToken}`)
}

type PaymentConfirmedEmailInput = {
    orderToken: string
    buyerName: string
    buyerEmail: string
    totalAmountInKobo: number
    currency: string
    itemTitles: string[]
    checkoutUrl: string
}

/** Sends a buyer-facing confirmation once admin marks the transfer as paid. */
export async function sendPaymentConfirmedEmail(input: PaymentConfirmedEmailInput) {
    if (!resend) {
        console.warn(
            `[email] Skipped payment-confirmed email for order ${input.orderToken} — RESEND_API_KEY not configured.`,
        )
        return
    }

    const amount = formatPrice(input.totalAmountInKobo, input.currency)

    const result = await resend.emails.send({
        from: defaultFrom,
        to: input.buyerEmail,
        subject: `Payment confirmed — ${input.orderToken}`,
        react: createElement(PaymentConfirmedEmail, {
            buyerName: input.buyerName,
            orderToken: input.orderToken,
            amount,
            itemTitles: input.itemTitles,
            checkoutUrl: input.checkoutUrl,
        }),
        text: [
            `Hi ${input.buyerName},`,
            `Your payment for order ${input.orderToken} has been confirmed.`,
            `Amount: ${amount}`,
            `Books: ${input.itemTitles.join(", ")}`,
            `Open your downloads: ${input.checkoutUrl}`,
        ].join("\n"),
    })

    assertEmailSent(result, `payment-confirmed email for ${input.orderToken}`)
}
