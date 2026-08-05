import "server-only"

import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, type SQL } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { categories, ebooks } from "@/db/schema"
import type { CatalogFilters } from "@/lib/catalog-filters"
import { toCatalogCacheKey, toCatalogPageCacheKey } from "@/lib/catalog-filters"
import { withRedis } from "@/lib/redis"

const CATALOG_CACHE_TTL_SECONDS = 120

const catalogRowSchema = z.object({
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

const catalogRowsSchema = z.array(catalogRowSchema)

export type CatalogEbook = z.infer<typeof catalogRowSchema>

const catalogPageSchema = z.object({
    items: catalogRowsSchema,
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    totalPages: z.number().int().min(1),
})

export type CatalogPage = z.infer<typeof catalogPageSchema>

function buildCatalogWhereClauses(filters: CatalogFilters): SQL[] {
    const whereClauses = [eq(ebooks.isPublished, true)]

    if (filters.category) {
        whereClauses.push(eq(categories.slug, filters.category))
    }

    if (filters.q) {
        const q = `%${filters.q}%`
        const keywordClause = or(
            ilike(ebooks.title, q),
            ilike(ebooks.author, q),
            ilike(categories.name, q),
        )

        if (keywordClause) {
            whereClauses.push(keywordClause)
        }
    }

    if (filters.minPriceInKobo !== undefined) {
        whereClauses.push(gte(ebooks.priceInKobo, filters.minPriceInKobo))
    }

    if (filters.maxPriceInKobo !== undefined) {
        whereClauses.push(lte(ebooks.priceInKobo, filters.maxPriceInKobo))
    }

    return whereClauses
}

function catalogSortBy(filters: CatalogFilters) {
    return {
        title: asc(ebooks.title),
        price_low: asc(ebooks.priceInKobo),
        price_high: desc(ebooks.priceInKobo),
        newest: desc(ebooks.createdAt),
    }[filters.sort]
}

const catalogSelection = {
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
}

/** Unpaginated top-N lookup, used for rails and "related ebooks" — not for the paginated catalog listing. */
export async function getCatalogEbooks(filters: CatalogFilters): Promise<CatalogEbook[]> {
    const cacheKey = toCatalogCacheKey(filters)

    const cached = await withRedis((client) => client.get(cacheKey))
    if (typeof cached === "string") {
        const parsed = catalogRowsSchema.safeParse(JSON.parse(cached))
        if (parsed.success) {
            return parsed.data
        }
    }

    const rows = await db
        .select(catalogSelection)
        .from(ebooks)
        .leftJoin(categories, eq(categories.id, ebooks.categoryId))
        .where(and(...buildCatalogWhereClauses(filters)))
        .orderBy(catalogSortBy(filters))
        .limit(filters.pageSize)

    const validatedRows = catalogRowsSchema.parse(rows)

    await withRedis((client) =>
        client.set(cacheKey, JSON.stringify(validatedRows), { ex: CATALOG_CACHE_TTL_SECONDS }),
    )

    return validatedRows
}

/** Paginated catalog listing — backs the /catalog page and the /api/ebooks route consumed by TanStack Query. */
export async function getPaginatedCatalogEbooks(filters: CatalogFilters): Promise<CatalogPage> {
    const cacheKey = toCatalogPageCacheKey(filters)

    const cached = await withRedis((client) => client.get(cacheKey))
    if (typeof cached === "string") {
        const parsed = catalogPageSchema.safeParse(JSON.parse(cached))
        if (parsed.success) {
            return parsed.data
        }
    }

    const whereClauses = buildCatalogWhereClauses(filters)

    const [rows, [{ value: total }]] = await Promise.all([
        db
            .select(catalogSelection)
            .from(ebooks)
            .leftJoin(categories, eq(categories.id, ebooks.categoryId))
            .where(and(...whereClauses))
            .orderBy(catalogSortBy(filters))
            .limit(filters.pageSize)
            .offset((filters.page - 1) * filters.pageSize),
        db
            .select({ value: count() })
            .from(ebooks)
            .leftJoin(categories, eq(categories.id, ebooks.categoryId))
            .where(and(...whereClauses)),
    ])

    const result = catalogPageSchema.parse({
        items: rows,
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    })

    await withRedis((client) =>
        client.set(cacheKey, JSON.stringify(result), { ex: CATALOG_CACHE_TTL_SECONDS }),
    )

    return result
}

/** Looks up published ebooks by id — backs /api/ebooks/by-ids for the client-side favourites list. */
export async function getEbooksByIds(ids: string[]): Promise<CatalogEbook[]> {
    if (ids.length === 0) {
        return []
    }

    const rows = await db
        .select(catalogSelection)
        .from(ebooks)
        .leftJoin(categories, eq(categories.id, ebooks.categoryId))
        .where(and(eq(ebooks.isPublished, true), inArray(ebooks.id, ids)))

    return catalogRowsSchema.parse(rows)
}
