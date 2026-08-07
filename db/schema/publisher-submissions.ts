import {
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core"

import { categories } from "@/db/schema/categories"
import { ebookFormatEnum, ebooks } from "@/db/schema/ebooks"
import { orderItems, orders } from "@/db/schema/orders"

export const publisherSubmissionStatusEnum = pgEnum("publisher_submission_status", [
    "draft",
    "pending_review",
    "approved",
    "rejected",
])

export const publisherPayoutMethodEnum = pgEnum("publisher_payout_method", [
    "bank",
    "paypal",
    "payoneer",
])

export const payoutStatusEnum = pgEnum("publisher_payout_status", ["pending", "disbursed"])

export const publisherSubmissions = pgTable(
    "publisher_submissions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        pseudonym: varchar("pseudonym", { length: 180 }).notNull(),
        contactEmail: varchar("contact_email", { length: 320 }).notNull(),
        title: varchar("title", { length: 240 }).notNull(),
        authorDisplayName: varchar("author_display_name", { length: 180 }).notNull(),
        description: text("description").notNull(),
        categoryId: uuid("category_id").references(() => categories.id, {
            onDelete: "set null",
            onUpdate: "cascade",
        }),
        edition: varchar("edition", { length: 80 }),
        format: ebookFormatEnum("format").notNull().default("pdf"),
        suggestedPriceInKobo: integer("suggested_price_in_kobo").notNull(),
        adminFinalPriceInKobo: integer("admin_final_price_in_kobo"),
        currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
        coverImageUrl: text("cover_image_url"),
        cloudinaryPublicId: varchar("cloudinary_public_id", { length: 255 }).notNull().unique(),
        payoutMethod: publisherPayoutMethodEnum("payout_method").notNull(),
        bankAccountName: varchar("bank_account_name", { length: 180 }),
        bankAccountNumber: varchar("bank_account_number", { length: 80 }),
        bankCodeSwift: varchar("bank_code_swift", { length: 80 }),
        paypalEmail: varchar("paypal_email", { length: 320 }),
        payoneerEmail: varchar("payoneer_email", { length: 320 }),
        status: publisherSubmissionStatusEnum("status").notNull().default("draft"),
        reviewNotes: text("review_notes"),
        approvedEbookId: uuid("approved_ebook_id").references(() => ebooks.id, {
            onDelete: "set null",
            onUpdate: "cascade",
        }),
        listingUrl: text("listing_url"),
        approvedAt: timestamp("approved_at", { withTimezone: true }),
        rejectedAt: timestamp("rejected_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("publisher_submissions_status_idx").on(table.status),
        index("publisher_submissions_created_idx").on(table.createdAt),
        index("publisher_submissions_email_idx").on(table.contactEmail),
        index("publisher_submissions_pseudonym_idx").on(table.pseudonym),
    ],
)

export const publisherEarnings = pgTable(
    "publisher_earnings",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        submissionId: uuid("submission_id")
            .notNull()
            .references(() => publisherSubmissions.id, { onDelete: "cascade", onUpdate: "cascade" }),
        ebookId: uuid("ebook_id")
            .notNull()
            .references(() => ebooks.id, { onDelete: "restrict", onUpdate: "cascade" }),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
        orderItemId: uuid("order_item_id")
            .notNull()
            .references(() => orderItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
        grossSaleInKobo: integer("gross_sale_in_kobo").notNull(),
        platformFeeInKobo: integer("platform_fee_in_kobo").notNull(),
        publisherNetInKobo: integer("publisher_net_in_kobo").notNull(),
        currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
        payoutMonth: varchar("payout_month", { length: 7 }).notNull(),
        payoutStatus: payoutStatusEnum("payout_status").notNull().default("pending"),
        disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("publisher_earnings_order_item_unique").on(table.orderItemId),
        index("publisher_earnings_submission_idx").on(table.submissionId),
        index("publisher_earnings_payout_month_idx").on(table.payoutMonth),
        index("publisher_earnings_payout_status_idx").on(table.payoutStatus),
    ],
)