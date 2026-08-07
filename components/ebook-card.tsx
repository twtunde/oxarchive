import { AddToCartButton } from "@/components/add-to-cart-button"
import { BookText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { FavoriteButton } from "@/components/favorite-button"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Badge } from "@/components/ui/badge"
import type { CatalogEbook } from "@/db/queries/catalog"
import { formatPrice } from "@/lib/format"

type EbookCardProps = {
  ebook: CatalogEbook
  revealIndex?: number
}

export function EbookCard({ ebook, revealIndex = 0 }: EbookCardProps) {
  return (
    <ScrollReveal
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/20"
      index={revealIndex}
      threshold={0.1}
    >
      <FavoriteButton
        ebookId={ebook.id}
        size="icon-sm"
        className="absolute top-2 right-2 z-10"
      />

      <Link href={`/ebooks/${ebook.slug}`} className="contents">
        <div className="relative h-52 w-full shrink-0 overflow-hidden bg-muted sm:aspect-2/3 sm:h-auto">
          {ebook.coverImageUrl ? (
            <Image
              src={ebook.coverImageUrl}
              alt={ebook.title}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <BookText className="size-10" aria-hidden />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="rounded-full">
              {ebook.categoryName ?? "Uncategorized"}
            </Badge>
            {ebook.edition ? (
              <Badge variant="outline" className="rounded-full">
                {ebook.edition}
              </Badge>
            ) : null}
          </div>

          <div className="space-y-1">
            <h2 className="line-clamp-2 font-display text-lg leading-tight">
              {ebook.title}
            </h2>
            <p className="text-sm text-muted-foreground">By {ebook.author}</p>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {ebook.description}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-3">
            <Badge variant="outline" className="rounded-full uppercase">
              {ebook.format.replace("_", "/")}
            </Badge>
            <span className="font-semibold">
              {formatPrice(ebook.priceInKobo, ebook.currency)}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <AddToCartButton
          ebookId={ebook.id}
          variant="secondary"
          className="w-full"
        />
      </div>
    </ScrollReveal>
  )
}
