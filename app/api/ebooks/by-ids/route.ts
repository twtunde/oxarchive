import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { getEbooksByIds } from "@/db/queries/catalog"

const idsSchema = z.array(z.string().uuid()).max(100)

export async function GET(request: NextRequest) {
    const rawIds = request.nextUrl.searchParams
        .get("ids")
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean) ?? []

    const parsed = idsSchema.safeParse(rawIds)
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid ids parameter.", issues: z.flattenError(parsed.error).fieldErrors },
            { status: 400 },
        )
    }

    const items = await getEbooksByIds(parsed.data)

    return NextResponse.json({ items })
}
