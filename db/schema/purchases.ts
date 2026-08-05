import { index, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

import { ebooks } from "@/db/schema/ebooks"
import { orderItems, orders } from "@/db/schema/orders"

export const downloadLinkStateEnum = pgEnum("download_link_state", ["active", "expired", "needs_regeneration"])

export const purchases = pgTable(
    "purchases",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
        orderItemId: uuid("order_item_id")
            .notNull()
            .unique()
            .references(() => orderItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
        ebookId: uuid("ebook_id")
            .notNull()
            .references(() => ebooks.id, { onDelete: "restrict", onUpdate: "cascade" }),
        userId: uuid("user_id"),
        buyerEmail: varchar("buyer_email", { length: 320 }).notNull(),
        accessToken: varchar("access_token", { length: 86 }).notNull().unique(),
        linkState: downloadLinkStateEnum("link_state").notNull().default("active"),
        downloadExpiresAt: timestamp("download_expires_at", { withTimezone: true }).notNull(),
        lastIssuedAt: timestamp("last_issued_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("purchases_access_token_idx").on(table.accessToken),
        index("purchases_buyer_email_idx").on(table.buyerEmail),
        index("purchases_user_id_idx").on(table.userId),
        index("purchases_order_id_idx").on(table.orderId),
        index("purchases_link_state_idx").on(table.linkState),
        index("purchases_download_expiry_idx").on(table.downloadExpiresAt),
    ],
)
