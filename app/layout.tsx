import { Geist_Mono, Newsreader, Roboto } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { getSiteUrl, siteConfig } from "@/lib/seo"
import { cn } from "@/lib/utils"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Oxarchive | Curated technical and research ebooks",
    template: "%s | Oxarchive",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/seo/site.webmanifest",
  icons: {
    icon: [
      { url: "/seo/favicon.ico" },
      { url: "/seo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/seo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/seo/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/seo/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/seo/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/seo/favicon.ico" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.defaultLocale,
    url: "/",
    title: "Oxarchive | Curated technical and research ebooks",
    description: siteConfig.description,
    images: [
      {
        url: "/seo/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Oxarchive - Curated technical and research ebooks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oxarchive | Curated technical and research ebooks",
    description: siteConfig.description,
    images: ["/seo/android-chrome-512x512.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable,
        newsreader.variable
      )}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
