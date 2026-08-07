import { z } from "zod"

import { NIGERIAN_BANKS } from "@/lib/nigerian-banks"

export const payoutMethodSchema = z.enum(["bank", "paypal", "payoneer"])

const basePublisherSubmissionSchema = z.object({
    pseudonym: z.string().trim().min(2, "Pseudonym must be at least 2 characters.").max(180),
    contactEmail: z.email("Enter a valid contact email.").max(320),
    title: z.string().trim().min(2, "Book title is required.").max(240),
    authorDisplayName: z.string().trim().min(2, "Author display name is required.").max(180),
    description: z.string().trim().min(20, "Description must be at least 20 characters."),
    categoryId: z.string().uuid("Choose a valid category."),
    edition: z
        .string()
        .trim()
        .max(80)
        .optional()
        .transform((value) => (value ? value : undefined)),
    format: z.enum(["pdf", "epub"]),
    suggestedPriceInMainUnit: z.coerce.number().positive("Suggested price must be greater than 0."),
    payoutMethod: payoutMethodSchema,
    bankName: z
        .string()
        .trim()
        .refine((value) => value.length === 0 || NIGERIAN_BANKS.includes(value as (typeof NIGERIAN_BANKS)[number]), {
            message: "Choose a valid Nigerian bank.",
        })
        .optional()
        .transform((value) => (value ? value : undefined)),
    bankAccountName: z
        .string()
        .trim()
        .max(180)
        .optional()
        .transform((value) => (value ? value : undefined)),
    bankAccountNumber: z
        .string()
        .trim()
        .max(80)
        .optional()
        .transform((value) => (value ? value : undefined)),
    bankCodeSwift: z
        .string()
        .trim()
        .max(80)
        .optional()
        .transform((value) => (value ? value : undefined)),
    paypalEmail: z
        .string()
        .trim()
        .max(320)
        .optional()
        .transform((value) => (value ? value : undefined)),
    payoneerEmail: z
        .string()
        .trim()
        .max(320)
        .optional()
        .transform((value) => (value ? value : undefined)),
})

export const publisherSubmissionSchema = basePublisherSubmissionSchema.superRefine((value, ctx) => {
    if (value.payoutMethod === "bank") {
        if (!value.bankName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["bankName"],
                message: "Bank name is required for bank payout.",
            })
        }

        if (!value.bankAccountName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["bankAccountName"],
                message: "Bank account name is required for bank payout.",
            })
        }

        if (!value.bankAccountNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["bankAccountNumber"],
                message: "Bank account number is required for bank payout.",
            })
        }

        if (!value.bankCodeSwift) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["bankCodeSwift"],
                message: "Bank code or SWIFT is required for bank payout.",
            })
        }
    }

    if (value.payoutMethod === "paypal" && !value.paypalEmail) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["paypalEmail"],
            message: "PayPal email is required for PayPal payout.",
        })
    }

    if (value.payoutMethod === "payoneer" && !value.payoneerEmail) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["payoneerEmail"],
            message: "Payoneer email is required for Payoneer payout.",
        })
    }

    if (value.paypalEmail && !z.email().safeParse(value.paypalEmail).success) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["paypalEmail"],
            message: "Enter a valid PayPal email.",
        })
    }

    if (value.payoneerEmail && !z.email().safeParse(value.payoneerEmail).success) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["payoneerEmail"],
            message: "Enter a valid Payoneer email.",
        })
    }
})

export const adminReviewSchema = z.object({
    submissionId: z.string().uuid(),
    finalPriceInMainUnit: z.coerce.number().positive("Final price must be greater than 0."),
    reviewNotes: z
        .string()
        .trim()
        .max(1000)
        .optional()
        .transform((value) => (value ? value : undefined)),
})

export const adminRejectSchema = z.object({
    submissionId: z.string().uuid(),
    reviewNotes: z.string().trim().min(8, "Add a short rejection reason.").max(1000),
})

export type PublisherSubmissionInput = z.infer<typeof publisherSubmissionSchema>