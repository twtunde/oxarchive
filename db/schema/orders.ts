import { index, integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { ebooks } from "@/db/schema/ebooks"

export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "failed", "cancelled"])

export const orders = pgTable(
    "orders",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orderToken: varchar("order_token", { length: 64 }).notNull(),
        buyerName: varchar("buyer_name", { length: 160 }).notNull(),
        buyerEmail: varchar("buyer_email", { length: 320 }).notNull(),
        userId: uuid("user_id"),
        status: orderStatusEnum("status").notNull().default("pending"),
        paymentProviderReference: varchar("payment_provider_reference", { length: 128 }),
        currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
        totalAmountInKobo: integer("total_amount_in_kobo").notNull(),
        // Set when the buyer clicks "I've made the transfer" — status stays "pending"
        // until an admin manually verifies the bank transfer and marks it "paid".
        buyerConfirmedAt: timestamp("buyer_confirmed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("orders_order_token_unique").on(table.orderToken),
        index("orders_buyer_email_idx").on(table.buyerEmail),
        index("orders_user_id_idx").on(table.userId),
        index("orders_status_idx").on(table.status),
    ],
)

export const orderItems = pgTable(
    "order_items",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
        ebookId: uuid("ebook_id")
            .notNull()
            .references(() => ebooks.id, { onDelete: "restrict", onUpdate: "cascade" }),
        quantity: integer("quantity").notNull().default(1),
        unitPriceInKobo: integer("unit_price_in_kobo").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("order_items_order_id_idx").on(table.orderId),
        index("order_items_ebook_id_idx").on(table.ebookId),
    ],
)
