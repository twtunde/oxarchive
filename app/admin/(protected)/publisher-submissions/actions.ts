"use server"

import { randomBytes } from "node:crypto"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { ebooks, publisherSubmissions } from "@/db/schema"
import {
    sendPublisherPayoutSummaryEmail,
    sendPublisherSubmissionApprovedEmail,
    sendPublisherSubmissionRejectedEmail,
} from "@/lib/email"
import { adminRejectSchema, adminReviewSchema } from "@/lib/publisher-submission-schema"
import { invalidateCatalogCache } from "@/lib/redis"
import { slugify } from "@/lib/slugify"

function buildListingUrl(slug: string) {
    return `/ebooks/${slug}`
}

function buildUniqueSlug(base: string) {
    const fallback = `book-${randomBytes(3).toString("hex")}`
    return slugify(base) || fallback
}

export async function queueSubmissionForReviewAction(formData: FormData): Promise<void> {
    const submissionId = formData.get("submissionId")
    if (typeof submissionId !== "string") {
        return
    }

    await db
        .update(publisherSubmissions)
        .set({ status: "pending_review", updatedAt: new Date() })
        .where(
            and(
                eq(publisherSubmissions.id, submissionId),
                eq(publisherSubmissions.status, "draft"),
            ),
        )

    revalidatePath("/admin/publisher-submissions")
}

export async function approveSubmissionAction(formData: FormData): Promise<void> {
    const parsed = adminReviewSchema.safeParse({
        submissionId: formData.get("submissionId"),
        finalPriceInMainUnit: formData.get("finalPriceInMainUnit"),
        reviewNotes: formData.get("reviewNotes"),
    })

    if (!parsed.success) {
        return
    }

    const submission = await db.query.publisherSubmissions.findFirst({
        where: eq(publisherSubmissions.id, parsed.data.submissionId),
    })

    if (!submission) {
        return
    }

    if (submission.status !== "draft" && submission.status !== "pending_review") {
        return
    }

    const finalPriceInKobo = Math.round(parsed.data.finalPriceInMainUnit * 100)
    const baseSlug = buildUniqueSlug(submission.title)

    const createdEbook = await db.transaction(async (tx) => {
        let slug = baseSlug

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const [created] = await tx
                    .insert(ebooks)
                    .values({
                        categoryId: submission.categoryId,
                        title: submission.title,
                        slug,
                        author: submission.authorDisplayName,
                        description: submission.description,
                        coverImageUrl: submission.coverImageUrl,
                        cloudinaryPublicId: submission.cloudinaryPublicId,
                        format: submission.format,
                        edition: submission.edition,
                        priceInKobo: finalPriceInKobo,
                        currency: submission.currency,
                        isPublished: true,
                    })
                    .returning({ id: ebooks.id, slug: ebooks.slug })

                return created
            } catch (error) {
                const isUniqueViolation =
                    error && typeof error === "object" && "code" in error && error.code === "23505"
                if (!isUniqueViolation || attempt === 4) {
                    throw error
                }

                slug = `${baseSlug}-${randomBytes(2).toString("hex")}`
            }
        }

        throw new Error("Unable to generate unique listing slug.")
    })

    const listingUrl = buildListingUrl(createdEbook.slug)

    await db
        .update(publisherSubmissions)
        .set({
            status: "approved",
            approvedEbookId: createdEbook.id,
            adminFinalPriceInKobo: finalPriceInKobo,
            reviewNotes: parsed.data.reviewNotes ?? null,
            listingUrl,
            approvedAt: new Date(),
            rejectedAt: null,
            updatedAt: new Date(),
        })
        .where(eq(publisherSubmissions.id, parsed.data.submissionId))

    await sendPublisherSubmissionApprovedEmail({
        pseudonym: submission.pseudonym,
        title: submission.title,
        contactEmail: submission.contactEmail,
        listingUrl,
        suggestedPriceInKobo: submission.suggestedPriceInKobo,
        finalPriceInKobo,
        currency: submission.currency,
    })

    revalidatePath("/")
    revalidatePath("/catalog")
    revalidatePath("/admin/publisher-submissions")
    await invalidateCatalogCache()
}

export async function rejectSubmissionAction(formData: FormData): Promise<void> {
    const parsed = adminRejectSchema.safeParse({
        submissionId: formData.get("submissionId"),
        reviewNotes: formData.get("reviewNotes"),
    })

    if (!parsed.success) {
        return
    }

    const submission = await db.query.publisherSubmissions.findFirst({
        where: eq(publisherSubmissions.id, parsed.data.submissionId),
    })

    if (!submission) {
        return
    }

    await db
        .update(publisherSubmissions)
        .set({
            status: "rejected",
            reviewNotes: parsed.data.reviewNotes,
            rejectedAt: new Date(),
            approvedAt: null,
            updatedAt: new Date(),
        })
        .where(eq(publisherSubmissions.id, parsed.data.submissionId))

    await sendPublisherSubmissionRejectedEmail({
        pseudonym: submission.pseudonym,
        title: submission.title,
        contactEmail: submission.contactEmail,
        reason: parsed.data.reviewNotes,
    })

    revalidatePath("/admin/publisher-submissions")
}

export async function sendPayoutSummaryAction(formData: FormData): Promise<void> {
    const payoutMonth = formData.get("payoutMonth")
    const pseudonym = formData.get("pseudonym")
    const contactEmail = formData.get("contactEmail")
    const grossSaleInKobo = Number(formData.get("grossSaleInKobo"))
    const platformFeeInKobo = Number(formData.get("platformFeeInKobo"))
    const publisherNetInKobo = Number(formData.get("publisherNetInKobo"))
    const salesCount = Number(formData.get("salesCount"))
    const currency = formData.get("currency")

    if (
        typeof payoutMonth !== "string" ||
        typeof pseudonym !== "string" ||
        typeof contactEmail !== "string" ||
        typeof currency !== "string" ||
        !Number.isFinite(grossSaleInKobo) ||
        !Number.isFinite(platformFeeInKobo) ||
        !Number.isFinite(publisherNetInKobo) ||
        !Number.isFinite(salesCount)
    ) {
        return
    }

    await sendPublisherPayoutSummaryEmail({
        payoutMonth,
        pseudonym,
        contactEmail,
        grossSaleInKobo,
        platformFeeInKobo,
        publisherNetInKobo,
        salesCount,
        currency,
    })
}