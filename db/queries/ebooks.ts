import "server-only"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { categories, ebooks } from "@/db/schema"

const ebookDetailSchema = z.object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    author: z.string(),
    description: z.string(),
    edition: z.string().nullable(),
    format: z.enum(["pdf", "epub", "pdf_epub"]),
    coverImageUrl: z.string().nullable(),
    categoryName: z.string().nullable(),
    categorySlug: z.string().nullable(),
    priceInKobo: z.number().int().nonnegative(),
    currency: z.string().length(3),
    createdAt: z.coerce.date(),
})

export type EbookDetail = z.infer<typeof ebookDetailSchema>

const ebookPreviewAssetSchema = z.object({
    slug: z.string(),
    title: z.string(),
    cloudinaryPublicId: z.string(),
    format: z.enum(["pdf", "epub", "pdf_epub"]),
})

export type EbookPreviewAsset = z.infer<typeof ebookPreviewAssetSchema>

export async function getEbookBySlug(slug: string): Promise<EbookDetail | null> {
    const [row] = await db
        .select({
            id: ebooks.id,
            slug: ebooks.slug,
            title: ebooks.title,
            author: ebooks.author,
            description: ebooks.description,
            edition: ebooks.edition,
            format: ebooks.format,
            coverImageUrl: ebooks.coverImageUrl,
            categoryName: categories.name,
            categorySlug: categories.slug,
            priceInKobo: ebooks.priceInKobo,
            currency: ebooks.currency,
            createdAt: ebooks.createdAt,
        })
        .from(ebooks)
        .leftJoin(categories, eq(categories.id, ebooks.categoryId))
        .where(and(eq(ebooks.slug, slug), eq(ebooks.isPublished, true)))
        .limit(1)

    if (!row) {
        return null
    }

    return ebookDetailSchema.parse(row)
}

export async function getEbookPreviewAssetBySlug(slug: string): Promise<EbookPreviewAsset | null> {
    const [row] = await db
        .select({
            slug: ebooks.slug,
            title: ebooks.title,
            cloudinaryPublicId: ebooks.cloudinaryPublicId,
            format: ebooks.format,
        })
        .from(ebooks)
        .where(and(eq(ebooks.slug, slug), eq(ebooks.isPublished, true)))
        .limit(1)

    if (!row) {
        return null
    }

    return ebookPreviewAssetSchema.parse(row)
}
