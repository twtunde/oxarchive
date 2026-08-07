import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/db"
import { publisherSubmissions } from "@/db/schema"
import { uploadEbookAsset, uploadEbookCover, validateEbookUploadFile } from "@/lib/cloudinary"
import { sendPublisherSubmissionReceivedEmail } from "@/lib/email"
import { publisherSubmissionSchema } from "@/lib/publisher-submission-schema"

const EBOOK_FILE_MAX_BYTES = 50 * 1024 * 1024
const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024

function fileFromFormData(formData: FormData, key: string): File | null {
    const value = formData.get(key)
    return value instanceof File && value.size > 0 ? value : null
}

export async function POST(request: Request) {
    const formData = await request.formData()

    const parsed = publisherSubmissionSchema.safeParse({
        pseudonym: formData.get("pseudonym"),
        contactEmail: formData.get("contactEmail"),
        title: formData.get("title"),
        authorDisplayName: formData.get("authorDisplayName"),
        description: formData.get("description"),
        categoryId: formData.get("categoryId"),
        edition: formData.get("edition"),
        format: formData.get("format"),
        suggestedPriceInMainUnit: formData.get("suggestedPriceInMainUnit"),
        payoutMethod: formData.get("payoutMethod"),
        bankAccountName: formData.get("bankAccountName"),
        bankAccountNumber: formData.get("bankAccountNumber"),
        bankCodeSwift: formData.get("bankCodeSwift"),
        paypalEmail: formData.get("paypalEmail"),
        payoneerEmail: formData.get("payoneerEmail"),
    })

    const fieldErrors: Record<string, string[]> = parsed.success
        ? {}
        : (z.flattenError(parsed.error).fieldErrors as Record<string, string[]>)

    const ebookFile = fileFromFormData(formData, "ebookFile")
    if (!ebookFile) {
        fieldErrors.ebookFile = ["Select a PDF or EPUB file."]
    } else {
        try {
            validateEbookUploadFile(ebookFile)
        } catch (error) {
            fieldErrors.ebookFile = [
                error instanceof Error ? error.message : "Invalid ebook file.",
            ]
        }

        if (ebookFile.size > EBOOK_FILE_MAX_BYTES) {
            fieldErrors.ebookFile = ["File must be 50MB or smaller."]
        }
    }

    const coverImage = fileFromFormData(formData, "coverImage")
    if (coverImage) {
        if (!coverImage.type.startsWith("image/")) {
            fieldErrors.coverImage = ["Cover must be an image file."]
        } else if (coverImage.size > COVER_IMAGE_MAX_BYTES) {
            fieldErrors.coverImage = ["Cover must be 5MB or smaller."]
        }
    }

    if (!parsed.success || Object.keys(fieldErrors).length > 0) {
        return NextResponse.json(
            {
                status: "error",
                message: "Fix the highlighted fields.",
                fieldErrors,
            },
            { status: 400 },
        )
    }

    const category = await db.query.categories.findFirst({
        where: (table, { eq }) => eq(table.id, parsed.data.categoryId),
        columns: { id: true },
    })

    if (!category) {
        return NextResponse.json(
            {
                status: "error",
                message: "That category no longer exists.",
                fieldErrors: { categoryId: ["Choose a valid category."] },
            },
            { status: 400 },
        )
    }

    const { publicId } = await uploadEbookAsset(ebookFile!)
    const coverImageUrl = coverImage ? (await uploadEbookCover(coverImage)).secureUrl : null

    const [created] = await db
        .insert(publisherSubmissions)
        .values({
            pseudonym: parsed.data.pseudonym,
            contactEmail: parsed.data.contactEmail,
            title: parsed.data.title,
            authorDisplayName: parsed.data.authorDisplayName,
            description: parsed.data.description,
            categoryId: parsed.data.categoryId,
            edition: parsed.data.edition ?? null,
            format: parsed.data.format,
            suggestedPriceInKobo: Math.round(parsed.data.suggestedPriceInMainUnit * 100),
            currency: "NGN",
            coverImageUrl,
            cloudinaryPublicId: publicId,
            payoutMethod: parsed.data.payoutMethod,
            bankAccountName: parsed.data.bankAccountName ?? null,
            bankAccountNumber: parsed.data.bankAccountNumber ?? null,
            bankCodeSwift: parsed.data.bankCodeSwift ?? null,
            paypalEmail: parsed.data.paypalEmail ?? null,
            payoneerEmail: parsed.data.payoneerEmail ?? null,
            status: "draft",
        })
        .returning({ id: publisherSubmissions.id, title: publisherSubmissions.title })

    await sendPublisherSubmissionReceivedEmail({
        pseudonym: parsed.data.pseudonym,
        title: created.title,
        contactEmail: parsed.data.contactEmail,
    })

    return NextResponse.json({
        status: "success",
        submissionId: created.id,
        message: "Draft submitted. We will review and notify you by email.",
    })
}