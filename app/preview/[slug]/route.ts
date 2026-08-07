import { Buffer } from "node:buffer"

import { NextResponse } from "next/server"

import { getEbookPreviewAssetBySlug } from "@/db/queries/ebooks"
import { buildPdfPreview, DEFAULT_PREVIEW_PAGE_COUNT } from "@/lib/ebook-preview"
import { getSignedEbookDownloadUrl } from "@/lib/cloudinary"

type PreviewRouteProps = {
    params: Promise<{ slug: string }>
}

export async function GET(_request: Request, { params }: PreviewRouteProps) {
    const { slug } = await params
    const ebook = await getEbookPreviewAssetBySlug(slug)

    if (!ebook) {
        return new NextResponse("Preview not found.", { status: 404 })
    }

    if (ebook.format === "epub") {
        return new NextResponse("Preview is only available for PDF titles.", {
            status: 422,
        })
    }

    const sourceUrl = getSignedEbookDownloadUrl(ebook.cloudinaryPublicId, "pdf", {
        ttlSeconds: 60,
    })

    const sourceResponse = await fetch(sourceUrl, { cache: "no-store" })
    if (!sourceResponse.ok) {
        return new NextResponse("Preview is temporarily unavailable.", {
            status: 502,
        })
    }

    const sourcePdf = new Uint8Array(await sourceResponse.arrayBuffer())
    const previewPdf = await buildPdfPreview(sourcePdf, {
        pageCount: DEFAULT_PREVIEW_PAGE_COUNT,
    })

    const previewBody = Buffer.from(previewPdf)

    return new NextResponse(previewBody, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${slug}-preview.pdf"`,
            "Cache-Control": "private, no-store, max-age=0",
            "X-Preview-Pages": String(DEFAULT_PREVIEW_PAGE_COUNT),
        },
    })
}
