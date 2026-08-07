import { PDFDocument } from "pdf-lib"

const DEFAULT_PREVIEW_PAGE_COUNT = 7

type BuildPdfPreviewOptions = {
    pageCount?: number
}

/**
 * Creates a trimmed preview PDF from the beginning of a source PDF.
 * The output is capped to `pageCount` pages and keeps page order intact.
 */
export async function buildPdfPreview(
    sourcePdf: Uint8Array,
    options?: BuildPdfPreviewOptions,
): Promise<Uint8Array> {
    const source = await PDFDocument.load(sourcePdf)
    const totalPages = source.getPageCount()
    const pageCount = Math.max(1, options?.pageCount ?? DEFAULT_PREVIEW_PAGE_COUNT)
    const previewPageCount = Math.min(totalPages, pageCount)

    const preview = await PDFDocument.create()
    const pageIndexes = Array.from({ length: previewPageCount }, (_, index) => index)
    const copiedPages = await preview.copyPages(source, pageIndexes)

    copiedPages.forEach((page) => preview.addPage(page))

    return preview.save()
}

export { DEFAULT_PREVIEW_PAGE_COUNT }