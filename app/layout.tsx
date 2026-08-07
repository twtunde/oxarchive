import { Geist_Mono, Newsreader, Roboto } from "next/font/google"
import type { Metadata } from "next"
import Script from "next/script"

import "./globals.css"
import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
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
        url: "/opengraph.png",
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
    images: ["/opengraph.png"],
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
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
        <Script id="tawk-init" strategy="afterInteractive">
          {`
            var TAWK_WIDGET_ID = '1jv9kftie';

            function applyTawkMobileOffset() {
              if (!window.matchMedia('(max-width: 767px)').matches) {
                return;
              }

              var selector = [
                'iframe[src*="' + TAWK_WIDGET_ID + '"]',
                'iframe[title*="chat widget"]',
                '#tawkchat-container',
                '#tawkchat-minified-wrapper'
              ].join(',');

              var nodes = document.querySelectorAll(selector);
              nodes.forEach(function (node) {
                if (node && node.style) {
                  node.style.setProperty('bottom', '96px', 'important');
                }
              });
            }

            window.Tawk_API = window.Tawk_API || {};
            window.Tawk_LoadStart = new Date();
            window.Tawk_API.customStyle = {
              visibility: {
                desktop: {
                  position: 'br',
                  xOffset: '20px',
                  yOffset: '20px'
                },
                mobile: {
                  position: 'br',
                  xOffset: '16px',
                  yOffset: '96px'
                }
              }
            };

            window.Tawk_API.onLoad = function () {
              applyTawkMobileOffset();

              var attempts = 0;
              var maxAttempts = 20;
              var intervalId = window.setInterval(function () {
                attempts += 1;
                applyTawkMobileOffset();
                if (attempts >= maxAttempts) {
                  window.clearInterval(intervalId);
                }
              }, 250);
            };
          `}
        </Script>
        <Script
          id="tawk-widget"
          src="https://embed.tawk.to/6a7387271d75e11d48ca6316/1jv9kftie"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  )
}
