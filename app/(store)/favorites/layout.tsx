import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Favourites",
  description: "Your saved ebooks on Oxarchive.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/favorites",
  },
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
