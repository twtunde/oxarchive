import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { getPaginatedCatalogEbooks } from "@/db/queries/catalog"
import { parseCatalogFilters } from "@/lib/catalog-filters"

export async function GET(request: NextRequest) {
    try {
        const filters = parseCatalogFilters(Object.fromEntries(request.nextUrl.searchParams))
        const result = await getPaginatedCatalogEbooks(filters)

        return NextResponse.json(result)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid query parameters.", issues: z.flattenError(error).fieldErrors },
                { status: 400 },
            )
        }

        throw error
    }
}
