import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { EbookRailItem } from "@/components/ebook-rail-item"
import { FavoriteButton } from "@/components/favorite-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCatalogEbooks } from "@/db/queries/catalog"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Explore featured technical and research ebooks curated by Oxarchive.",
  alternates: {
    canonical: "/",
  },
}

export default async function LandingPage() {
  const latest = await getCatalogEbooks({
    sort: "newest",
    pageSize: 7,
    page: 1,
  })
  const [featured, ...rest] = latest
  const rail = rest.slice(0, 6)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-12 sm:px-10 sm:py-16">
      <section>
        {featured ? (
          <div className="grid gap-10 sm:grid-cols-2 sm:items-center sm:gap-16">
            <div className="space-y-5">
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Newly catalogued
              </p>

              <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                {featured.title}
              </h1>

              <p className="font-display text-lg text-muted-foreground italic">
                {featured.author}
              </p>

              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                {featured.description}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full">
                  {featured.categoryName ?? "Uncategorized"}
                </Badge>
                <Badge variant="outline" className="rounded-full uppercase">
                  {featured.format.replace("_", "/")}
                </Badge>
                <span className="text-sm font-semibold">
                  {formatPrice(featured.priceInKobo, featured.currency)}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link href={`/ebooks/${featured.slug}`}>Read more</Link>
                </Button>
                <AddToCartButton
                  ebookId={featured.id}
                  variant="secondary"
                  size="lg"
                  className="rounded-full px-6"
                />
                <FavoriteButton ebookId={featured.id} size="icon-lg" />
              </div>
            </div>

            <div className="relative mx-auto aspect-2/3 w-48 rotate-3 overflow-hidden rounded-lg bg-muted shadow-xl sm:w-64">
              {featured.coverImageUrl ? (
                <Image
                  src={featured.coverImageUrl}
                  alt={featured.title}
                  fill
                  sizes="256px"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="font-display text-2xl">
              The archive is empty, for now.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Published ebooks will appear here as soon as they&apos;re added.
            </p>
          </div>
        )}
      </section>

      {rail.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl">New in the archive</h2>
            <Link
              href="/catalog"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Visit all books →
            </Link>
          </div>

          <ol className="divide-y divide-border">
            {rail.map((ebook, index) => (
              <EbookRailItem key={ebook.id} ebook={ebook} rank={index + 1} />
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  )
}
