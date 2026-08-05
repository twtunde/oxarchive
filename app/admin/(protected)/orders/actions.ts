"use server"

import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { getOrderByToken, markOrderFailed, markOrderPaid } from "@/db/queries/orders"
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth"
import { sendPaymentConfirmedEmail } from "@/lib/email"

const updateOrderSchema = z.object({
    orderId: z.uuid("Invalid order id."),
    orderToken: z.string().trim().min(3).max(64),
})

async function ensureAdminSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

    if (!verifyAdminSession(session)) {
        throw new Error("Unauthorized")
    }
}

async function revalidateOrderPaths(orderToken: string) {
    revalidatePath("/admin/orders")
    revalidatePath(`/checkout/${orderToken}`)
}

function getBaseUrlFromHeaders(headersList: Headers): string {
    const forwardedProto = headersList.get("x-forwarded-proto")
    const forwardedHost = headersList.get("x-forwarded-host")
    const host = forwardedHost ?? headersList.get("host") ?? "localhost:3000"
    const protocol = forwardedProto ?? (host.includes("localhost") ? "http" : "https")

    return `${protocol}://${host}`
}

export async function markOrderPaidAction(formData: FormData) {
    await ensureAdminSession()

    const parsed = updateOrderSchema.safeParse({
        orderId: formData.get("orderId"),
        orderToken: formData.get("orderToken"),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid form data.")
    }

    await markOrderPaid(parsed.data.orderId)

    const order = await getOrderByToken(parsed.data.orderToken)
    if (order) {
        const headersList = await headers()
        const baseUrl = getBaseUrlFromHeaders(headersList)

        await sendPaymentConfirmedEmail({
            orderToken: order.orderToken,
            buyerName: order.buyerName,
            buyerEmail: order.buyerEmail,
            totalAmountInKobo: order.totalAmountInKobo,
            currency: order.currency,
            itemTitles: order.items.map((item) => item.ebook.title),
            checkoutUrl: `${baseUrl}/checkout/${encodeURIComponent(order.orderToken)}`,
        })
    }

    await revalidateOrderPaths(parsed.data.orderToken)
}

export async function markOrderFailedAction(formData: FormData) {
    await ensureAdminSession()

    const parsed = updateOrderSchema.safeParse({
        orderId: formData.get("orderId"),
        orderToken: formData.get("orderToken"),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid form data.")
    }

    await markOrderFailed(parsed.data.orderId)
    await revalidateOrderPaths(parsed.data.orderToken)
}
