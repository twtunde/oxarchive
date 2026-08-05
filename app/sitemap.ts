import type { MetadataRoute } from "next"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { ebooks } from "@/db/schema"
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getSiteUrl()

    const staticEntries: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            changeFrequency: "daily",
            priority: 1,
            lastModified: new Date(),
        },
        {
            url: toAbsoluteUrl("/catalog"),
            changeFrequency: "daily",
            priority: 0.9,
            lastModified: new Date(),
        },
        {
            url: toAbsoluteUrl("/privacy-policy"),
            changeFrequency: "monthly",
            priority: 0.4,
            lastModified: new Date(),
        },
        {
            url: toAbsoluteUrl("/terms-and-conditions"),
            changeFrequency: "monthly",
            priority: 0.4,
            lastModified: new Date(),
        },
        {
            url: toAbsoluteUrl("/return-policy"),
            changeFrequency: "monthly",
            priority: 0.4,
            lastModified: new Date(),
        },
    ]

    const publishedEbooks = await db
        .select({ slug: ebooks.slug, createdAt: ebooks.createdAt })
        .from(ebooks)
        .where(and(eq(ebooks.isPublished, true)))

    const ebookEntries: MetadataRoute.Sitemap = publishedEbooks.map((ebook) => ({
        url: toAbsoluteUrl(`/ebooks/${ebook.slug}`),
        changeFrequency: "weekly",
        priority: 0.8,
        lastModified: ebook.createdAt,
    }))

    return [...staticEntries, ...ebookEntries]
}
