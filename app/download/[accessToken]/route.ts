import { NextResponse } from "next/server"

import { getPurchaseByAccessToken, markPurchaseIssued } from "@/db/queries/orders"
import { getSignedEbookDownloadUrl } from "@/lib/cloudinary"

type DownloadRouteProps = {
    params: Promise<{ accessToken: string }>
}

export async function GET(_request: Request, { params }: DownloadRouteProps) {
    const { accessToken } = await params
    const purchase = await getPurchaseByAccessToken(accessToken)

    if (!purchase) {
        return new NextResponse("Download link not found.", { status: 404 })
    }

    if (purchase.linkState !== "active") {
        return new NextResponse("This download link is unavailable.", { status: 410 })
    }

    if (purchase.downloadExpiresAt.getTime() < Date.now()) {
        return new NextResponse("This download link has expired.", { status: 410 })
    }

    const extension = purchase.ebook.format === "epub" ? "epub" : "pdf"
    const downloadUrl = getSignedEbookDownloadUrl(
        purchase.ebook.cloudinaryPublicId,
        extension,
        {
            ttlSeconds: 5 * 60,
        }
    )

    await markPurchaseIssued(purchase.id)

    return NextResponse.redirect(downloadUrl)
}
