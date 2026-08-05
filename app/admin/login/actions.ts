"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { ADMIN_SESSION_COOKIE, hashAdminSecret, verifyAdminSecret } from "@/lib/admin-auth"
import { env } from "@/lib/env"

const loginSchema = z.object({
    secret: z.string().min(1, "Enter the admin secret."),
})

export type AdminLoginState = {
    error?: string
}

export async function adminLoginAction(
    _prevState: AdminLoginState,
    formData: FormData,
): Promise<AdminLoginState> {
    const parsed = loginSchema.safeParse({ secret: formData.get("secret") })

    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
    }

    if (!verifyAdminSecret(parsed.data.secret)) {
        return { error: "Incorrect admin secret." }
    }

    const cookieStore = await cookies()
    cookieStore.set(ADMIN_SESSION_COOKIE, hashAdminSecret(), {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/admin",
        maxAge: 60 * 60 * 8,
    })

    redirect("/admin/orders")
}
