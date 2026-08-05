import { BookText, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { FavoriteButton } from "@/components/favorite-button"
import type { CatalogEbook } from "@/db/queries/catalog"
import { formatPrice } from "@/lib/format"

type EbookRailItemProps = {
  ebook: CatalogEbook
  rank: number
}

export function EbookRailItem({ ebook, rank }: EbookRailItemProps) {
  return (
    <li className="flex items-center gap-5 py-4">
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
        <p className="truncate text-sm text-muted-foreground">
          {ebook.author}
        </p>
      </Link>

      <span className="hidden shrink-0 text-sm font-medium sm:inline">
        {formatPrice(ebook.priceInKobo, ebook.currency)}
      </span>

      <span
        aria-disabled
        title="Coming soon"
        className="hidden size-8 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-muted-foreground/40 sm:flex"
      >
        <ShoppingBag className="size-4" aria-hidden />
      </span>
      <FavoriteButton
        ebookId={ebook.id}
        size="icon-sm"
        className="hidden shrink-0 border-none bg-transparent sm:flex dark:bg-transparent"
      />
    </li>
  )
}
