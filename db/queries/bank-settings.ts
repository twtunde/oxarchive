import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { bankSettings } from "@/db/schema"

export type BankAccount = typeof bankSettings.$inferSelect

/** Active bank accounts shown to buyers at checkout. */
export async function getActiveBankAccounts(): Promise<BankAccount[]> {
    return db.query.bankSettings.findMany({
        where: eq(bankSettings.isActive, true),
        orderBy: desc(bankSettings.createdAt),
    })
}

export async function listBankAccountsForAdmin(): Promise<BankAccount[]> {
    return db.query.bankSettings.findMany({
        orderBy: desc(bankSettings.createdAt),
    })
}

type CreateBankAccountInput = {
    bankName: string
    accountNumber: string
    accountName: string
}

export async function createBankAccount(input: CreateBankAccountInput): Promise<void> {
    await db.insert(bankSettings).values(input)
}

export async function setBankAccountActive(id: string, isActive: boolean): Promise<void> {
    await db.update(bankSettings).set({ isActive, updatedAt: new Date() }).where(eq(bankSettings.id, id))
}

export async function deleteBankAccount(id: string): Promise<void> {
    await db.delete(bankSettings).where(eq(bankSettings.id, id))
}
