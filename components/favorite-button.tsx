"use client"

import { Heart } from "lucide-react"
import { useSyncExternalStore } from "react"

import { Button, type buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFavoritesStore } from "@/lib/stores/favorites-store"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

type FavoriteButtonProps = {
  ebookId: string
  className?: string
  size?: VariantProps<typeof buttonVariants>["size"]
}

export function FavoriteButton({
  ebookId,
  className,
  size = "icon",
}: FavoriteButtonProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated)
  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.includes(ebookId)
  )
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  if (!isMounted || !hasHydrated) {
    return (
      <Skeleton
        aria-hidden
        className={cn(
          "rounded-full",
          size === "icon-lg"
            ? "size-9"
            : size === "icon-sm"
              ? "size-7"
              : "size-8",
          className
        )}
      />
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
      title={isFavorite ? "Remove from favourites" : "Add to favourites"}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(ebookId)
      }}
      className={cn("rounded-full", className)}
    >
      <Heart
        className={cn("size-4", isFavorite && "fill-primary text-primary")}
        aria-hidden
      />
    </Button>
  )
}
