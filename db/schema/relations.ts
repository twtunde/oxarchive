import { relations } from "drizzle-orm"

import { categories } from "@/db/schema/categories"
import { ebooks } from "@/db/schema/ebooks"
import { orderItems, orders } from "@/db/schema/orders"
import { publisherEarnings, publisherSubmissions } from "@/db/schema/publisher-submissions"
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
    publisherEarnings: many(publisherEarnings),
    publisherSubmissions: many(publisherSubmissions),
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
    publisherEarning: one(publisherEarnings, {
        fields: [orderItems.id],
        references: [publisherEarnings.orderItemId],
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

export const publisherSubmissionsRelations = relations(publisherSubmissions, ({ one, many }) => ({
    category: one(categories, {
        fields: [publisherSubmissions.categoryId],
        references: [categories.id],
    }),
    approvedEbook: one(ebooks, {
        fields: [publisherSubmissions.approvedEbookId],
        references: [ebooks.id],
    }),
    earnings: many(publisherEarnings),
}))

export const publisherEarningsRelations = relations(publisherEarnings, ({ one }) => ({
    submission: one(publisherSubmissions, {
        fields: [publisherEarnings.submissionId],
        references: [publisherSubmissions.id],
    }),
    ebook: one(ebooks, {
        fields: [publisherEarnings.ebookId],
        references: [ebooks.id],
    }),
    order: one(orders, {
        fields: [publisherEarnings.orderId],
        references: [orders.id],
    }),
    orderItem: one(orderItems, {
        fields: [publisherEarnings.orderItemId],
        references: [orderItems.id],
    }),
}))
