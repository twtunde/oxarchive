"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

import { EbookCard } from "@/components/ebook-card"
import { Button } from "@/components/ui/button"
import type { CatalogPage } from "@/db/queries/catalog"
import type { CatalogFilters } from "@/lib/catalog-filters"
import {
  parseCatalogFilters,
  toCatalogSearchParams,
} from "@/lib/catalog-filters"

type CatalogListProps = {
  filters: CatalogFilters
  initialData: CatalogPage
}

async function fetchCatalogPage(filters: CatalogFilters): Promise<CatalogPage> {
  const params = toCatalogSearchParams(filters)
  const response = await fetch(`/api/ebooks?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to load ebooks.")
  }

  return response.json() as Promise<CatalogPage>
}

export function CatalogList({ filters, initialData }: CatalogListProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlFilters = useMemo(
    () => parseCatalogFilters(Object.fromEntries(searchParams.entries())),
    [searchParams]
  )
  const currentFilters: CatalogFilters = { ...urlFilters }
  const isInitialFilters =
    filters.category === urlFilters.category &&
    filters.q === urlFilters.q &&
    filters.minPriceInKobo === urlFilters.minPriceInKobo &&
    filters.maxPriceInKobo === urlFilters.maxPriceInKobo &&
    filters.sort === urlFilters.sort &&
    filters.pageSize === urlFilters.pageSize

  const { data, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["ebooks", currentFilters],
    queryFn: () => fetchCatalogPage(currentFilters),
    initialData:
      isInitialFilters && urlFilters.page === filters.page
        ? initialData
        : undefined,
    placeholderData: keepPreviousData,
  })

  const result = data ?? initialData
  const { items, total, totalPages } = result
  const page = currentFilters.page

  function updatePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextPage <= 1) {
      params.delete("page")
    } else {
      params.set("page", String(nextPage))
    }

    const nextUrl =
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No ebooks match your current filters.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ul
        className="grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3"
        style={{ opacity: isPlaceholderData ? 0.6 : 1 }}
      >
        {items.map((ebook) => (
          <li key={ebook.id}>
            <EbookCard ebook={ebook} />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {total} book{total === 1 ? "" : "s"} · Page {page} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            disabled={page <= 1 || isFetching}
            onClick={() => updatePage(Math.max(1, page - 1))}
          >
            <ChevronLeft className="size-4" aria-hidden />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            disabled={page >= totalPages || isFetching}
            onClick={() => updatePage(Math.min(totalPages, page + 1))}
          >
            <ChevronRight className="size-4" aria-hidden />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
