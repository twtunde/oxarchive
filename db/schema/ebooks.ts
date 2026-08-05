import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

import { categories } from "@/db/schema/categories"

export const ebookFormatEnum = pgEnum("ebook_format", ["pdf", "epub", "pdf_epub"])

export const ebooks = pgTable(
    "ebooks",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        categoryId: uuid("category_id").references(() => categories.id, {
            onDelete: "set null",
            onUpdate: "cascade",
        }),
        title: varchar("title", { length: 240 }).notNull(),
        slug: varchar("slug", { length: 260 }).notNull().unique(),
        author: varchar("author", { length: 180 }).notNull(),
        description: text("description").notNull(),
        coverImageUrl: text("cover_image_url"),
        cloudinaryPublicId: varchar("cloudinary_public_id", { length: 255 }).notNull().unique(),
        format: ebookFormatEnum("format").notNull().default("pdf"),
        edition: varchar("edition", { length: 80 }),
        priceInKobo: integer("price_in_kobo").notNull(),
        currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
        isPublished: boolean("is_published").notNull().default(false),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("ebooks_slug_idx").on(table.slug),
        index("ebooks_category_idx").on(table.categoryId),
        index("ebooks_published_idx").on(table.isPublished),
        index("ebooks_price_idx").on(table.priceInKobo),
    ],
)
