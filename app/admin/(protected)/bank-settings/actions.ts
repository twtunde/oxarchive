"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
    createBankAccount,
    deleteBankAccount,
    setBankAccountActive,
} from "@/db/queries/bank-settings"
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-auth"

const createBankAccountSchema = z.object({
    bankName: z.string().trim().min(2).max(160),
    accountNumber: z.string().trim().min(6).max(32),
    accountName: z.string().trim().min(2).max(160),
})

const updateBankAccountSchema = z.object({
    id: z.uuid("Invalid bank account id."),
})

async function ensureAdminSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

    if (!verifyAdminSession(session)) {
        throw new Error("Unauthorized")
    }
}

function revalidateBankPaths() {
    revalidatePath("/admin/bank-settings")
    revalidatePath("/checkout/[orderToken]", "page")
}

export async function createBankAccountAction(formData: FormData) {
    await ensureAdminSession()

    const parsed = createBankAccountSchema.safeParse({
        bankName: formData.get("bankName"),
        accountNumber: formData.get("accountNumber"),
        accountName: formData.get("accountName"),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid form data.")
    }

    await createBankAccount(parsed.data)
    revalidateBankPaths()
}

export async function toggleBankAccountActiveAction(formData: FormData) {
    await ensureAdminSession()

    const parsed = updateBankAccountSchema.safeParse({
        id: formData.get("id"),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid form data.")
    }

    const isActive = formData.get("isActive") === "true"
    await setBankAccountActive(parsed.data.id, !isActive)
    revalidateBankPaths()
}

export async function deleteBankAccountAction(formData: FormData) {
    await ensureAdminSession()

    const parsed = updateBankAccountSchema.safeParse({
        id: formData.get("id"),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid form data.")
    }

    await deleteBankAccount(parsed.data.id)
    revalidateBankPaths()
}
