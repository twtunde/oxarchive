"use server"

import { z } from "zod"

import { createOrder } from "@/db/queries/orders"

const createTransferOrderSchema = z.object({
    buyerName: z.string().trim().min(2, "Enter your full name.").max(160),
    buyerEmail: z.email("Enter a valid email address.").max(320),
    ebookIds: z
        .string()
        .transform((value) =>
            value
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
        )
        .pipe(z.array(z.string().uuid("Invalid ebook selection.")).min(1, "Your bag is empty.").max(25)),
})

export type CreateTransferOrderState = {
    status: "idle" | "error" | "success"
    message?: string
    fieldErrors?: Record<string, string[]>
    orderToken?: string
}

export async function createTransferOrderAction(
    _prevState: CreateTransferOrderState,
    formData: FormData
): Promise<CreateTransferOrderState> {
    const parsed = createTransferOrderSchema.safeParse({
        buyerName: formData.get("buyerName"),
        buyerEmail: formData.get("buyerEmail"),
        ebookIds: formData.get("ebookIds"),
    })

    if (!parsed.success) {
        return {
            status: "error",
            message: "Please check your details and try again.",
            fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
        }
    }

    try {
        const { orderToken } = await createOrder({
            buyerName: parsed.data.buyerName,
            buyerEmail: parsed.data.buyerEmail,
            ebookIds: parsed.data.ebookIds,
        })

        return {
            status: "success",
            orderToken,
        }
    } catch (error) {
        if (error instanceof Error) {
            return {
                status: "error",
                message: error.message,
            }
        }

        return {
            status: "error",
            message: "Could not create your order. Please try again.",
        }
    }
}
