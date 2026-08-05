import { z } from "zod"

const rawCatalogFiltersSchema = z.object({
    category: z.string().trim().min(1).max(140).optional(),
    q: z.string().trim().min(1).max(240).optional(),
    minPriceInKobo: z.coerce.number().int().min(0).optional(),
    maxPriceInKobo: z.coerce.number().int().min(0).optional(),
    sort: z.enum(["title", "price_low", "price_high", "newest"]).default("title"),
    pageSize: z.coerce.number().int().min(1).max(100).default(24),
    page: z.coerce.number().int().min(1).default(1),
})

export type CatalogFilters = z.infer<typeof rawCatalogFiltersSchema>

function firstValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0]
    }

    return value
}

export function parseCatalogFilters(searchParams: Record<string, string | string[] | undefined>): CatalogFilters {
    const parsed = rawCatalogFiltersSchema.parse({
        category: firstValue(searchParams.category),
        q: firstValue(searchParams.q),
        minPriceInKobo: firstValue(searchParams.minPriceInKobo),
        maxPriceInKobo: firstValue(searchParams.maxPriceInKobo),
        sort: firstValue(searchParams.sort),
        pageSize: firstValue(searchParams.pageSize),
        page: firstValue(searchParams.page),
    })

    if (
        parsed.minPriceInKobo !== undefined &&
        parsed.maxPriceInKobo !== undefined &&
        parsed.minPriceInKobo > parsed.maxPriceInKobo
    ) {
        return {
            ...parsed,
            minPriceInKobo: parsed.maxPriceInKobo,
            maxPriceInKobo: parsed.minPriceInKobo,
        }
    }

    return parsed
}

export function toCatalogSearchParams(filters: CatalogFilters): URLSearchParams {
    const params = new URLSearchParams()

    if (filters.category) params.set("category", filters.category)
    if (filters.q) params.set("q", filters.q)
    if (filters.minPriceInKobo !== undefined) params.set("minPriceInKobo", String(filters.minPriceInKobo))
    if (filters.maxPriceInKobo !== undefined) params.set("maxPriceInKobo", String(filters.maxPriceInKobo))
    params.set("sort", filters.sort)
    params.set("pageSize", String(filters.pageSize))
    params.set("page", String(filters.page))

    return params
}

function toCatalogFilterSegments(filters: CatalogFilters) {
    return [
        filters.category ?? "all",
        filters.q ?? "",
        filters.minPriceInKobo ?? "",
        filters.maxPriceInKobo ?? "",
        filters.sort,
        filters.pageSize,
    ]
}

/** Unpaginated top-N lookups (landing page rail, related ebooks). */
export function toCatalogCacheKey(filters: CatalogFilters) {
    return ["catalog", "ebooks", "list", ...toCatalogFilterSegments(filters)].join(":")
}

/** Paginated catalog listing — namespaced separately since it caches {items, total} instead of an array. */
export function toCatalogPageCacheKey(filters: CatalogFilters) {
    return ["catalog", "ebooks", "page", ...toCatalogFilterSegments(filters), filters.page].join(":")
}
