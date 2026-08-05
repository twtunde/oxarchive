"use server"

import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { categories, ebooks } from "@/db/schema"
import { uploadEbookAsset, uploadEbookCover, validateEbookUploadFile } from "@/lib/cloudinary"
import { invalidateCatalogCache } from "@/lib/redis"
import { slugify } from "@/lib/slugify"

const EBOOK_FILE_MAX_BYTES = 50 * 1024 * 1024
const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024

const ebookFieldsSchema = z.object({
    title: z.string().trim().min(1, "Title is required.").max(240),
    slug: z
        .string()
        .trim()
        .max(260)
        .optional()
        .transform((value) => (value ? value : undefined)),
    author: z.string().trim().min(1, "Author is required.").max(180),
    description: z.string().trim().min(1, "Description is required."),
    categoryId: z.string().uuid("Choose a category."),
    edition: z
        .string()
        .trim()
        .max(80)
        .optional()
        .transform((value) => (value ? value : undefined)),
    format: z.enum(["pdf", "epub"]),
    priceInMainUnit: z.coerce.number().positive("Price must be greater than 0."),
})

export type CreateEbookState = {
    status: "idle" | "success" | "error"
    message?: string
    fieldErrors?: Record<string, string[]>
    slug?: string
    submissionId?: string
}

function fileFromFormData(formData: FormData, key: string): File | null {
    const value = formData.get(key)
    return value instanceof File && value.size > 0 ? value : null
}

export async function createEbookAction(
    _prevState: CreateEbookState,
    formData: FormData,
): Promise<CreateEbookState> {
    const parsed = ebookFieldsSchema.safeParse({
        title: formData.get("title"),
        slug: formData.get("slug"),
        author: formData.get("author"),
        description: formData.get("description"),
        categoryId: formData.get("categoryId"),
        edition: formData.get("edition"),
        format: formData.get("format"),
        priceInMainUnit: formData.get("priceInMainUnit"),
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
        return { status: "error", message: "Fix the highlighted fields.", fieldErrors }
    }

    const fields = parsed.data

    const category = await db.query.categories.findFirst({
        where: eq(categories.id, fields.categoryId),
        columns: { id: true },
    })

    if (!category) {
        return {
            status: "error",
            message: "That category no longer exists.",
            fieldErrors: { categoryId: ["Choose a valid category."] },
        }
    }

    const slug = fields.slug ? slugify(fields.slug) : slugify(fields.title)
    if (!slug) {
        return {
            status: "error",
            message: "Fix the highlighted fields.",
            fieldErrors: { title: ["Title must contain at least one letter or number."] },
        }
    }

    const { publicId } = await uploadEbookAsset(ebookFile!)
    const coverImageUrl = coverImage ? (await uploadEbookCover(coverImage)).secureUrl : null

    try {
        const [created] = await db
            .insert(ebooks)
            .values({
                categoryId: fields.categoryId,
                title: fields.title,
                slug,
                author: fields.author,
                description: fields.description,
                coverImageUrl,
                cloudinaryPublicId: publicId,
                format: fields.format,
                edition: fields.edition ?? null,
                priceInKobo: Math.round(fields.priceInMainUnit * 100),
                currency: "NGN",
                isPublished: formData.get("publish") === "on",
            })
            .returning({ slug: ebooks.slug })

        revalidatePath("/")
        revalidatePath("/catalog")
        await invalidateCatalogCache()

        return { status: "success", slug: created.slug, submissionId: randomUUID() }
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "23505") {
            return {
                status: "error",
                message: "That slug is already taken.",
                fieldErrors: { slug: ["Choose a different slug."] },
            }
        }

        throw error
    }
}
