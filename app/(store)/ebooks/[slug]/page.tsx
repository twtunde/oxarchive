import { BookText } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { AddToCartButton } from "@/components/add-to-cart-button"
import { EbookCard } from "@/components/ebook-card"
import { FavoriteButton } from "@/components/favorite-button"
import { Badge } from "@/components/ui/badge"
import { getCatalogEbooks } from "@/db/queries/catalog"
import { getEbookBySlug } from "@/db/queries/ebooks"
import { formatPrice } from "@/lib/format"

type EbookDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: EbookDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const ebook = await getEbookBySlug(slug)

  if (!ebook) {
    return {
      title: "Ebook",
      description: "Read technical and research ebooks on Oxarchive.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const shortDescription = ebook.description.slice(0, 160)

  return {
    title: `${ebook.title} by ${ebook.author}`,
    description: shortDescription,
    alternates: {
      canonical: `/ebooks/${ebook.slug}`,
    },
    openGraph: {
      title: `${ebook.title} by ${ebook.author}`,
      description: shortDescription,
      url: `/ebooks/${ebook.slug}`,
      images: ebook.coverImageUrl
        ? [
            {
              url: ebook.coverImageUrl,
              alt: ebook.title,
            },
          ]
        : undefined,
    },
    twitter: {
      title: `${ebook.title} by ${ebook.author}`,
      description: shortDescription,
      images: ebook.coverImageUrl ? [ebook.coverImageUrl] : undefined,
    },
  }
}

export default async function EbookDetailPage({
  params,
}: EbookDetailPageProps) {
  const { slug } = await params
  const ebook = await getEbookBySlug(slug)

  if (!ebook) {
    notFound()
  }

  const related = ebook.categorySlug
    ? (
        await getCatalogEbooks({
          category: ebook.categorySlug,
          sort: "newest",
          pageSize: 5,
          page: 1,
        })
      )
        .filter((item) => item.id !== ebook.id)
        .slice(0, 4)
    : []

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <div className="grid gap-8 sm:grid-cols-[240px_1fr]">
        <div className="relative mx-auto h-80 w-full max-w-sm overflow-hidden rounded-xl bg-muted sm:mx-0 sm:aspect-2/3 sm:h-auto sm:max-w-none">
          {ebook.coverImageUrl ? (
            <Image
              src={ebook.coverImageUrl}
              alt={ebook.title}
              fill
              sizes="240px"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <BookText className="size-12" aria-hidden />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {ebook.categoryName ?? "Uncategorized"}
            {ebook.edition ? ` • ${ebook.edition}` : ""}
          </div>

          <h1 className="font-display text-3xl">{ebook.title}</h1>
          <p className="font-display text-muted-foreground italic">
            {ebook.author}
          </p>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="rounded-full uppercase">
              {ebook.format.replace("_", "/")}
            </Badge>
            <span className="text-2xl font-semibold">
              {formatPrice(ebook.priceInKobo, ebook.currency)}
            </span>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {ebook.description}
          </p>

          <div className="flex items-center gap-3">
            <AddToCartButton
              ebookId={ebook.id}
              className="flex-1 rounded-full sm:flex-none"
            />
            <FavoriteButton ebookId={ebook.id} size="icon-lg" />
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl">More in {ebook.categoryName}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <EbookCard ebook={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
