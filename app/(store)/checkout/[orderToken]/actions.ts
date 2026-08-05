"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { confirmBuyerTransfer } from "@/db/queries/orders"
import { sendTransferClaimedAlert } from "@/lib/email"

const confirmTransferSchema = z.object({
    orderToken: z.string().trim().min(3).max(64),
})

export type ConfirmTransferState = {
    status: "idle" | "error" | "success"
    message?: string
}

function getBaseUrlFromHeaders(headersList: Headers): string {
    const forwardedProto = headersList.get("x-forwarded-proto")
    const forwardedHost = headersList.get("x-forwarded-host")
    const host = forwardedHost ?? headersList.get("host") ?? "localhost:3000"
    const protocol = forwardedProto ?? (host.includes("localhost") ? "http" : "https")

    return `${protocol}://${host}`
}

export async function confirmTransferAction(
    _prevState: ConfirmTransferState,
    formData: FormData
): Promise<ConfirmTransferState> {
    const parsed = confirmTransferSchema.safeParse({
        orderToken: formData.get("orderToken"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: "Invalid order reference.",
        }
    }

    const order = await confirmBuyerTransfer(parsed.data.orderToken)

    if (!order) {
        return {
            status: "error",
            message: "Order not found.",
        }
    }

    if (order.status === "paid") {
        return {
            status: "success",
            message: "Payment is already verified. Your downloads are now available.",
        }
    }

    const headersList = await headers()
    const baseUrl = getBaseUrlFromHeaders(headersList)

    await sendTransferClaimedAlert({
        orderToken: order.orderToken,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        totalAmountInKobo: order.totalAmountInKobo,
        currency: order.currency,
        itemTitles: order.items.map((item) => item.ebook.title),
        verifyUrl: `${baseUrl}/admin/orders?orderToken=${encodeURIComponent(order.orderToken)}`,
    })

    revalidatePath(`/checkout/${order.orderToken}`)
    revalidatePath("/admin/orders")

    return {
        status: "success",
        message: "Great. We alerted the admin for verification. Your download buttons will appear after confirmation.",
    }
}
