"use client"

import { Filter, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CategoryOption = {
  slug: string
  name: string
}

type CategoryFilterDrawerProps = {
  categories: CategoryOption[]
  selectedCategory?: string
}

export function CategoryFilterDrawer({
  categories,
  selectedCategory,
}: CategoryFilterDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const selectedLabel = useMemo(() => {
    if (!selectedCategory) {
      return "All categories"
    }

    return (
      categories.find((category) => category.slug === selectedCategory)?.name ??
      "All categories"
    )
  }, [categories, selectedCategory])

  function applyCategory(nextCategory?: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextCategory) {
      params.set("category", nextCategory)
    } else {
      params.delete("category")
    }

    params.delete("page")

    const nextUrl =
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
    setOpen(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setOpen(true)}
        >
          <Filter className="size-4" aria-hidden />
          Filter by category
        </Button>
        <span className="text-xs text-muted-foreground">{selectedLabel}</span>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close category filter"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-border bg-background p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Filter by category</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" aria-hidden />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto pb-2">
              <Button
                type="button"
                variant={!selectedCategory ? "default" : "outline"}
                className="justify-start"
                onClick={() => applyCategory(undefined)}
              >
                All categories
              </Button>

              {categories.map((category) => (
                <Button
                  key={category.slug}
                  type="button"
                  variant={
                    selectedCategory === category.slug ? "default" : "outline"
                  }
                  className={cn("justify-start")}
                  onClick={() => applyCategory(category.slug)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="hidden flex-wrap gap-2 md:flex">
        <Button
          type="button"
          size="sm"
          variant={!selectedCategory ? "default" : "outline"}
          className="rounded-full"
          onClick={() => applyCategory(undefined)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.slug}
            type="button"
            size="sm"
            variant={selectedCategory === category.slug ? "default" : "outline"}
            className="rounded-full"
            onClick={() => applyCategory(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </>
  )
}
