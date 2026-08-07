import "server-only"

import { createElement } from "react"
import { Resend } from "resend"

import {
    PaymentConfirmedEmail,
    PublisherPayoutSummaryEmail,
    PublisherSubmissionApprovedEmail,
    PublisherSubmissionReceivedEmail,
    PublisherSubmissionRejectedEmail,
    TransferClaimedAlertEmail,
} from "@/lib/email-templates"
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

type PublisherSubmissionReceivedInput = {
    pseudonym: string
    title: string
    contactEmail: string
}

export async function sendPublisherSubmissionReceivedEmail(input: PublisherSubmissionReceivedInput) {
    if (!resend) {
        console.warn(
            `[email] Skipped submission-received email for ${input.title} — RESEND_API_KEY not configured.`,
        )
        return
    }

    const result = await resend.emails.send({
        from: defaultFrom,
        to: input.contactEmail,
        subject: `Submission received — ${input.title}`,
        react: createElement(PublisherSubmissionReceivedEmail, {
            pseudonym: input.pseudonym,
            title: input.title,
        }),
        text: [
            `Hi ${input.pseudonym},`,
            `We received your anonymous publication draft for ${input.title}.`,
            "Your draft is queued for editorial market review.",
        ].join("\n"),
    })

    assertEmailSent(result, `submission-received email for ${input.title}`)
}

type PublisherSubmissionApprovedInput = {
    pseudonym: string
    title: string
    contactEmail: string
    listingUrl: string
    suggestedPriceInKobo: number
    finalPriceInKobo: number
    currency: string
}

export async function sendPublisherSubmissionApprovedEmail(input: PublisherSubmissionApprovedInput) {
    if (!resend) {
        console.warn(
            `[email] Skipped submission-approved email for ${input.title} — RESEND_API_KEY not configured.`,
        )
        return
    }

    const suggestedPrice = formatPrice(input.suggestedPriceInKobo, input.currency)
    const finalPrice = formatPrice(input.finalPriceInKobo, input.currency)

    const result = await resend.emails.send({
        from: defaultFrom,
        to: input.contactEmail,
        subject: `Approved and listed — ${input.title}`,
        react: createElement(PublisherSubmissionApprovedEmail, {
            pseudonym: input.pseudonym,
            title: input.title,
            listingUrl: input.listingUrl,
            suggestedPrice,
            finalPrice,
        }),
        text: [
            `Hi ${input.pseudonym},`,
            `Your submission for ${input.title} has been approved and listed.`,
            `Suggested price: ${suggestedPrice}`,
            `Final listing price: ${finalPrice}`,
            `Listing URL: ${input.listingUrl}`,
        ].join("\n"),
    })

    assertEmailSent(result, `submission-approved email for ${input.title}`)
}

type PublisherSubmissionRejectedInput = {
    pseudonym: string
    title: string
    contactEmail: string
    reason: string
}

export async function sendPublisherSubmissionRejectedEmail(input: PublisherSubmissionRejectedInput) {
    if (!resend) {
        console.warn(
            `[email] Skipped submission-rejected email for ${input.title} — RESEND_API_KEY not configured.`,
        )
        return
    }

    const result = await resend.emails.send({
        from: defaultFrom,
        to: input.contactEmail,
        subject: `Submission update — ${input.title}`,
        react: createElement(PublisherSubmissionRejectedEmail, {
            pseudonym: input.pseudonym,
            title: input.title,
            reason: input.reason,
        }),
        text: [
            `Hi ${input.pseudonym},`,
            `Your submission for ${input.title} was not approved at this time.`,
            `Reviewer note: ${input.reason}`,
        ].join("\n"),
    })

    assertEmailSent(result, `submission-rejected email for ${input.title}`)
}

type PublisherPayoutSummaryInput = {
    pseudonym: string
    contactEmail: string
    payoutMonth: string
    grossSaleInKobo: number
    platformFeeInKobo: number
    publisherNetInKobo: number
    salesCount: number
    currency: string
}

export async function sendPublisherPayoutSummaryEmail(input: PublisherPayoutSummaryInput) {
    if (!resend) {
        console.warn(
            `[email] Skipped payout-summary email for ${input.pseudonym} (${input.payoutMonth}) — RESEND_API_KEY not configured.`,
        )
        return
    }

    const grossSales = formatPrice(input.grossSaleInKobo, input.currency)
    const platformFee = formatPrice(input.platformFeeInKobo, input.currency)
    const netPayout = formatPrice(input.publisherNetInKobo, input.currency)

    const result = await resend.emails.send({
        from: defaultFrom,
        to: input.contactEmail,
        subject: `Month-end payout summary — ${input.payoutMonth}`,
        react: createElement(PublisherPayoutSummaryEmail, {
            pseudonym: input.pseudonym,
            payoutMonth: input.payoutMonth,
            grossSales,
            platformFee,
            netPayout,
            salesCount: input.salesCount,
        }),
        text: [
            `Hi ${input.pseudonym},`,
            `Month-end payout summary for ${input.payoutMonth}:`,
            `Book sales: ${input.salesCount}`,
            `Gross sales: ${grossSales}`,
            `Platform fee (15%): ${platformFee}`,
            `Net payout: ${netPayout}`,
        ].join("\n"),
    })

    assertEmailSent(result, `payout-summary email for ${input.pseudonym} (${input.payoutMonth})`)
}
