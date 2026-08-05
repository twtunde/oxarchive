import "server-only"

import { v2 as cloudinary } from "cloudinary"
import { z } from "zod"

import { env } from "@/lib/env"

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
})

async function toDataUri(file: File) {
    const buffer = Buffer.from(await file.arrayBuffer())
    return `data:${file.type};base64,${buffer.toString("base64")}`
}

const ebookFileFormatSchema = z.enum(["pdf", "epub"])

export type EbookFileFormat = z.infer<typeof ebookFileFormatSchema>

const ALLOWED_EBOOK_MIME_TYPES: Record<EbookFileFormat, string[]> = {
    pdf: ["application/pdf"],
    epub: ["application/epub+zip"],
}

function getExtensionFromFilename(filename: string): string | null {
    const value = filename.trim()
    if (!value.includes(".")) {
        return null
    }

    const extension = value.split(".").pop()?.toLowerCase()
    return extension ?? null
}

/**
 * Validates the ebook file against the strict file types we support.
 * We intentionally require extension + expected mime to reduce accidental
 * misuploads and obvious content-type spoofing.
 */
export function validateEbookUploadFile(file: File): { format: EbookFileFormat } {
    const extension = getExtensionFromFilename(file.name)
    const parsed = ebookFileFormatSchema.safeParse(extension)

    if (!parsed.success) {
        throw new Error("File must be a .pdf or .epub.")
    }

    const format = parsed.data
    const allowedMimeTypes = ALLOWED_EBOOK_MIME_TYPES[format]

    if (!allowedMimeTypes.includes(file.type)) {
        throw new Error(`Invalid MIME type for .${format} file.`)
    }

    return { format }
}

export async function uploadEbookAsset(file: File): Promise<{ publicId: string }> {
    const { format } = validateEbookUploadFile(file)

    const result = await cloudinary.uploader.upload(await toDataUri(file), {
        resource_type: "raw",
        type: "authenticated",
        folder: "ebooks/raw",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        invalidate: false,
        format,
    })

    return { publicId: result.public_id }
}

export async function uploadEbookCover(file: File): Promise<{ secureUrl: string }> {
    const result = await cloudinary.uploader.upload(await toDataUri(file), {
        resource_type: "image",
        type: "upload",
        folder: "ebooks/covers",
        use_filename: true,
        unique_filename: true,
    })

    return { secureUrl: result.secure_url }
}

/** Short-lived signed URL for a raw, authenticated ebook asset — generated fresh per download attempt. */
export function getSignedEbookDownloadUrl(
    publicId: string,
    extension: EbookFileFormat,
    options?: { ttlSeconds?: number }
) {
    const expiresAt = Math.floor(Date.now() / 1000) + (options?.ttlSeconds ?? 5 * 60)

    return cloudinary.utils.private_download_url(publicId, extension, {
        resource_type: "raw",
        type: "authenticated",
        attachment: true,
        expires_at: expiresAt,
    })
}
