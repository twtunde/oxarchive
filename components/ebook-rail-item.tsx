import { BookText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { AddToCartButton } from "@/components/add-to-cart-button"
import { FavoriteButton } from "@/components/favorite-button"
import { ScrollReveal } from "@/components/scroll-reveal"
import type { CatalogEbook } from "@/db/queries/catalog"
import { formatPrice } from "@/lib/format"

type EbookRailItemProps = {
  ebook: CatalogEbook
  rank: number
  revealIndex?: number
}

export function EbookRailItem({
  ebook,
  rank,
  revealIndex = 0,
}: EbookRailItemProps) {
  return (
    <ScrollReveal
      as="li"
      className="flex items-center gap-5 py-4"
      index={revealIndex}
    >
      <span className="w-6 shrink-0 font-display text-lg text-muted-foreground/60">
        {String(rank).padStart(2, "0")}
      </span>

      <Link
        href={`/ebooks/${ebook.slug}`}
        className="relative aspect-2/3 w-12 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        {ebook.coverImageUrl ? (
          <Image
            src={ebook.coverImageUrl}
            alt={ebook.title}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <BookText className="size-4" aria-hidden />
          </div>
        )}
      </Link>

      <Link href={`/ebooks/${ebook.slug}`} className="min-w-0 flex-1">
        <p className="truncate font-display text-base">{ebook.title}</p>
        <p className="truncate text-sm text-muted-foreground">{ebook.author}</p>
      </Link>

      <span className="hidden shrink-0 text-sm font-medium sm:inline">
        {formatPrice(ebook.priceInKobo, ebook.currency)}
      </span>

      <AddToCartButton
        ebookId={ebook.id}
        iconOnly
        size="icon-sm"
        variant="outline"
        className="hidden shrink-0 rounded-full sm:flex"
      />
      <FavoriteButton
        ebookId={ebook.id}
        size="icon-sm"
        className="hidden shrink-0 sm:flex"
      />
    </ScrollReveal>
  )
}
