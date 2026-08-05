"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useMemo } from "react"

import { EbookCard } from "@/components/ebook-card"
import { Button } from "@/components/ui/button"
import type { CatalogEbook } from "@/db/queries/catalog"
import { useFavoritesStore } from "@/lib/stores/favorites-store"

async function fetchFavoriteEbooks(ids: string[]): Promise<CatalogEbook[]> {
  if (ids.length === 0) {
    return []
  }

  const params = new URLSearchParams({ ids: ids.join(",") })
  const response = await fetch(`/api/ebooks/by-ids?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to load favourites.")
  }

  const data = (await response.json()) as { items: CatalogEbook[] }
  return data.items
}

export default function FavoritesPage() {
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated)
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds)

  const { data, isLoading } = useQuery({
    queryKey: ["favorite-ebooks", favoriteIds],
    queryFn: () => fetchFavoriteEbooks(favoriteIds),
    enabled: hasHydrated,
  })

  const orderedEbooks = useMemo(() => {
    if (!data) {
      return []
    }

    // Most recently favourited first.
    const order = new Map(favoriteIds.map((id, index) => [id, index]))
    return [...data].sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0))
  }, [data, favoriteIds])

  const isPending = !hasHydrated || isLoading

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Your shelf
        </p>
        <h1 className="font-display text-3xl">Favourites</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Ebooks you&apos;ve saved for later. Stored on this device only.
        </p>
      </header>

      {isPending ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Loading your favourites…
        </div>
      ) : orderedEbooks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12 text-center">
          <p className="font-display text-xl">No favourites yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tap the heart on any book to save it here for later.
          </p>
          <Button asChild className="rounded-full px-6">
            <Link href="/catalog">Browse the archive</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedEbooks.map((ebook) => (
            <li key={ebook.id}>
              <EbookCard ebook={ebook} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
