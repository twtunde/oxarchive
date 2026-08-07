"use client"

import { Feather } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function PublishAnonymouslyFab() {
  const pathname = usePathname()

  if (pathname === "/publish-anonymously") {
    return null
  }

  return (
    <Link
      href="/publish-anonymously"
      aria-label="Publish anonymously"
      title="Publish anonymously"
      className="fixed right-4 bottom-44 z-[80] inline-flex size-[58px] items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none md:right-5 md:bottom-5"
    >
      <Feather className="size-5" aria-hidden />
      <span className="sr-only">Publish anonymously</span>
    </Link>
  )
}
