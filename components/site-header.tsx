"use client"

import { Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Input } from "@/components/ui/input"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(currentQuery)
  const [syncedQuery, setSyncedQuery] = useState(currentQuery)
  const isCatalogPage = pathname === "/catalog"

  // Reset local input state when the URL's query changes from outside this component.
  if (currentQuery !== syncedQuery) {
    setSyncedQuery(currentQuery)
    setQuery(currentQuery)
  }

  const applyQuery = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const normalizedQuery = nextQuery.trim()

      if (normalizedQuery.length > 0) {
        params.set("q", normalizedQuery)
      } else {
        params.delete("q")
      }

      // Search changes should start from the first page of results.
      params.delete("page")

      const nextUrl =
        params.size > 0 ? `${pathname}?${params.toString()}` : pathname
      router.replace(nextUrl, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (!isCatalogPage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      if (query === currentQuery) {
        return
      }

      applyQuery(query)
    }, 250)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [applyQuery, currentQuery, isCatalogPage, query])

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border bg-background px-6 py-5 sm:px-10">
      <form
        action="/catalog"
        className="relative mx-auto max-w-xl"
        onSubmit={(event) => {
          if (!isCatalogPage) {
            return
          }

          event.preventDefault()
          applyQuery(query)
        }}
      >
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          placeholder="Search book, author, or category"
          className="h-10 rounded-full border-border bg-card pl-9"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </form>
    </header>
  )
}
