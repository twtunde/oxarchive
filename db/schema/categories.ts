import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const categories = pgTable(
    "categories",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: varchar("name", { length: 120 }).notNull(),
        slug: varchar("slug", { length: 140 }).notNull().unique(),
        description: text("description"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index("categories_slug_idx").on(table.slug)],
)
