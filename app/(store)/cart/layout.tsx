import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cart checkout",
  description: "Review selected ebooks and proceed with transfer checkout.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/cart",
  },
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
