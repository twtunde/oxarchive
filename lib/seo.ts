export const siteConfig = {
    name: "Oxarchive",
    shortName: "Oxarchive",
    description:
        "A curated digital archive of professional, technical, and research-grade ebooks.",
    defaultLocale: "en_NG",
}

function normalizeBaseUrl(rawBaseUrl: string): string {
    const value = rawBaseUrl.trim()
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value
    }

    return `https://${value}`
}

export function getSiteUrl(): string {
    const configured = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL
    if (configured) {
        return normalizeBaseUrl(configured)
    }

    const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
    if (vercelUrl) {
        return normalizeBaseUrl(vercelUrl)
    }

    return "http://localhost:3000"
}

export function toAbsoluteUrl(path: string): string {
    const baseUrl = getSiteUrl()
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    return `${baseUrl}${normalizedPath}`
}
