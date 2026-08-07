import { describe, expect, it } from "vitest"

import { PDFDocument } from "pdf-lib"

import { buildPdfPreview } from "@/lib/ebook-preview"

async function createPdfWithPageCount(pageCount: number): Promise<Uint8Array> {
    const document = await PDFDocument.create()

    for (let index = 0; index < pageCount; index++) {
        document.addPage([595, 842])
    }

    return document.save()
}

describe("buildPdfPreview", () => {
    it("limits preview output to requested page count", async () => {
        const source = await createPdfWithPageCount(12)

        const previewBytes = await buildPdfPreview(source, { pageCount: 7 })
        const preview = await PDFDocument.load(previewBytes)

        expect(preview.getPageCount()).toBe(7)
    })

    it("returns all pages when the source has fewer pages than preview limit", async () => {
        const source = await createPdfWithPageCount(4)

        const previewBytes = await buildPdfPreview(source, { pageCount: 7 })
        const preview = await PDFDocument.load(previewBytes)

        expect(preview.getPageCount()).toBe(4)
    })
})
