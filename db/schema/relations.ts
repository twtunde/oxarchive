import { relations } from "drizzle-orm"

import { categories } from "@/db/schema/categories"
import { ebooks } from "@/db/schema/ebooks"
import { orderItems, orders } from "@/db/schema/orders"
import { purchases } from "@/db/schema/purchases"

export const categoriesRelations = relations(categories, ({ many }) => ({
    ebooks: many(ebooks),
}))

export const ebooksRelations = relations(ebooks, ({ one, many }) => ({
    category: one(categories, {
        fields: [ebooks.categoryId],
        references: [categories.id],
    }),
    orderItems: many(orderItems),
    purchases: many(purchases),
}))

export const ordersRelations = relations(orders, ({ many }) => ({
    items: many(orderItems),
    purchases: many(purchases),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    ebook: one(ebooks, {
        fields: [orderItems.ebookId],
        references: [ebooks.id],
    }),
    purchase: one(purchases, {
        fields: [orderItems.id],
        references: [purchases.orderItemId],
    }),
}))

export const purchasesRelations = relations(purchases, ({ one }) => ({
    order: one(orders, {
        fields: [purchases.orderId],
        references: [orders.id],
    }),
    orderItem: one(orderItems, {
        fields: [purchases.orderItemId],
        references: [orderItems.id],
    }),
    ebook: one(ebooks, {
        fields: [purchases.ebookId],
        references: [ebooks.id],
    }),
}))
