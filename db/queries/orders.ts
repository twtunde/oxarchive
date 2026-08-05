import "server-only"

import { randomBytes } from "node:crypto"

import { and, desc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import { ebooks, orderItems, orders, purchases } from "@/db/schema"
import { generateOrderToken } from "@/lib/order-token"

const ORDER_TOKEN_MAX_ATTEMPTS = 5
const DOWNLOAD_ACCESS_DAYS = 365

type CreateOrderInput = {
    buyerName: string
    buyerEmail: string
    ebookIds: string[]
}

/** Creates an order + its line items with a unique bank-transfer reference (orderToken). */
export async function createOrder(input: CreateOrderInput): Promise<{ orderToken: string }> {
    if (input.ebookIds.length === 0) {
        throw new Error("Order must include at least one ebook.")
    }

    const uniqueEbookIds = Array.from(new Set(input.ebookIds))

    const rows = await db
        .select({
            id: ebooks.id,
            priceInKobo: ebooks.priceInKobo,
            currency: ebooks.currency,
        })
        .from(ebooks)
        .where(and(eq(ebooks.isPublished, true), inArray(ebooks.id, uniqueEbookIds)))

    if (rows.length !== uniqueEbookIds.length) {
        throw new Error("One or more selected ebooks are unavailable.")
    }

    const currency = rows[0]?.currency ?? "NGN"
    const hasMixedCurrencies = rows.some((row) => row.currency !== currency)

    if (hasMixedCurrencies) {
        throw new Error("Cannot create one order across multiple currencies.")
    }

    const totalAmountInKobo = rows.reduce((sum, row) => sum + row.priceInKobo, 0)

    for (let attempt = 0; attempt < ORDER_TOKEN_MAX_ATTEMPTS; attempt++) {
        const orderToken = generateOrderToken()

        try {
            await db.transaction(async (tx) => {
                const [order] = await tx
                    .insert(orders)
                    .values({
                        orderToken,
                        buyerName: input.buyerName,
                        buyerEmail: input.buyerEmail,
                        currency,
                        totalAmountInKobo,
                    })
                    .returning({ id: orders.id })

                await tx.insert(orderItems).values(
                    rows.map((item) => ({
                        orderId: order.id,
                        ebookId: item.id,
                        unitPriceInKobo: item.priceInKobo,
                    })),
                )
            })

            return { orderToken }
        } catch (error) {
            const isUniqueViolation =
                error && typeof error === "object" && "code" in error && error.code === "23505"

            if (!isUniqueViolation || attempt === ORDER_TOKEN_MAX_ATTEMPTS - 1) {
                throw error
            }
        }
    }

    throw new Error("Failed to allocate a unique order token.")
}

function findOrderByToken(orderToken: string) {
    return db.query.orders.findFirst({
        where: eq(orders.orderToken, orderToken),
        with: {
            items: { with: { ebook: true } },
            purchases: true,
        },
    })
}

export type OrderDetail = NonNullable<Awaited<ReturnType<typeof findOrderByToken>>>

export async function getOrderByToken(orderToken: string): Promise<OrderDetail | null> {
    const order = await findOrderByToken(orderToken)
    return order ?? null
}

/** Marks that the buyer says they've sent the transfer — idempotent, keeps status "pending". */
export async function confirmBuyerTransfer(orderToken: string): Promise<OrderDetail | null> {
    const order = await findOrderByToken(orderToken)

    if (!order) {
        return null
    }

    if (!order.buyerConfirmedAt) {
        await db.update(orders).set({ buyerConfirmedAt: new Date() }).where(eq(orders.id, order.id))
    }

    return findOrderByToken(orderToken) as Promise<OrderDetail | null>
}

/** Admin-confirmed payment — flips the order to "paid" and grants a download purchase per item. */
export async function markOrderPaid(orderId: string): Promise<void> {
    await db.transaction(async (tx) => {
        const [order] = await tx.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId)).returning()

        const items = await tx.query.orderItems.findMany({
            where: eq(orderItems.orderId, orderId),
        })

        const downloadExpiresAt = new Date()
        downloadExpiresAt.setDate(downloadExpiresAt.getDate() + DOWNLOAD_ACCESS_DAYS)

        for (const item of items) {
            const existing = await tx.query.purchases.findFirst({
                where: eq(purchases.orderItemId, item.id),
            })

            if (existing) {
                continue
            }

            await tx.insert(purchases).values({
                orderId,
                orderItemId: item.id,
                ebookId: item.ebookId,
                buyerEmail: order.buyerEmail,
                accessToken: randomBytes(48).toString("base64url"),
                downloadExpiresAt,
            })
        }
    })
}

export async function markOrderFailed(orderId: string): Promise<void> {
    await db.update(orders).set({ status: "failed" }).where(eq(orders.id, orderId))
}

export type AdminOrderSummary = Awaited<ReturnType<typeof listOrdersForAdmin>>[number]

export async function listOrdersForAdmin() {
    const rows = await db.query.orders.findMany({
        orderBy: desc(orders.createdAt),
        with: {
            items: { with: { ebook: { columns: { title: true } } } },
        },
    })

    // Needs-verification orders (buyer says paid, awaiting review) surface first.
    return rows.sort((a, b) => {
        const aUrgent = a.status === "pending" && a.buyerConfirmedAt ? 1 : 0
        const bUrgent = b.status === "pending" && b.buyerConfirmedAt ? 1 : 0
        return bUrgent - aUrgent
    })
}

export async function getPurchaseByAccessToken(accessToken: string) {
    return db.query.purchases.findFirst({
        where: eq(purchases.accessToken, accessToken),
        with: { ebook: true },
    })
}

export async function markPurchaseIssued(purchaseId: string): Promise<void> {
    await db.update(purchases).set({ lastIssuedAt: new Date() }).where(eq(purchases.id, purchaseId))
}
