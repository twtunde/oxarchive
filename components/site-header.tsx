"use client"

import { Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const searchInputRef = useRef<HTMLInputElement>(null)
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

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) {
        return false
      }

      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "f") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      event.preventDefault()
      searchInputRef.current?.focus()
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border bg-background px-6 py-5 sm:px-10">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <form
          action="/catalog"
          className="relative mx-auto w-full max-w-xl"
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
            ref={searchInputRef}
            type="search"
            name="q"
            placeholder="Search book, author, or category"
            className="h-10 rounded-full border-border bg-card pr-10 pl-9"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <kbd
            className="pointer-events-none absolute top-1/2 right-3 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-[3px] border border-border bg-linear-to-b from-card to-muted/60 font-mono text-[10px] leading-none text-foreground/85 shadow-[0_1px_0_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            aria-hidden
          >
            F
          </kbd>
        </form>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-border bg-card px-3"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4" aria-hidden />
          ) : (
            <Moon className="size-4" aria-hidden />
          )}
          <kbd className="ml-2 inline-flex size-5 items-center justify-center rounded-[3px] border border-border bg-linear-to-b from-card to-muted/60 font-mono text-[10px] leading-none text-foreground/85 shadow-[0_1px_0_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            D
          </kbd>
        </Button>
      </div>
    </header>
  )
}
