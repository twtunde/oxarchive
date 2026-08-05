import { boolean, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const bankSettings = pgTable(
    "bank_settings",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        bankName: varchar("bank_name", { length: 160 }).notNull(),
        accountNumber: varchar("account_number", { length: 32 }).notNull(),
        accountName: varchar("account_name", { length: 160 }).notNull(),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index("bank_settings_is_active_idx").on(table.isActive)],
)
