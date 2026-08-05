import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl()

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/checkout", "/cart", "/favorites", "/download"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    }
}
