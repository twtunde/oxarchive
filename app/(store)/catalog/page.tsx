import type { Metadata } from "next"

import { getPaginatedCatalogEbooks } from "@/db/queries/catalog"
import { parseCatalogFilters } from "@/lib/catalog-filters"

import { CatalogList } from "./_components/catalog-list"

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Browse the full Oxarchive catalog of technical, industry, and research ebooks.",
  alternates: {
    canonical: "/catalog",
  },
}

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const filters = parseCatalogFilters(await searchParams)
  const result = await getPaginatedCatalogEbooks(filters)

  // Remounts CatalogList (resetting its internal page state) whenever filters other than page change.
  const filterKey = [
    filters.category,
    filters.q,
    filters.minPriceInKobo,
    filters.maxPriceInKobo,
    filters.sort,
    filters.pageSize,
  ].join(":")

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          All books
        </p>
        <h1 className="font-display text-3xl">The full archive</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Browse industry-focused ebooks, research materials, and technical
          references.
        </p>
      </header>

      <CatalogList key={filterKey} filters={filters} initialData={result} />
    </div>
  )
}
