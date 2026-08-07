"use client"

import { Heart } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { ClickLottieFeedback } from "@/components/click-lottie-feedback"
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
  const isCompactLike = size === "icon-sm"
  const [playToken, setPlayToken] = useState(0)
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
        setPlayToken((value) => value + 1)
        toggleFavorite(ebookId)
      }}
      className={cn(
        "relative overflow-visible rounded-full transition-colors",
        isFavorite
          ? isCompactLike
            ? "border-red-200 bg-red-50/80 text-red-500 hover:border-red-300 hover:bg-red-100"
            : "border-red-300 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100"
          : isCompactLike
            ? "hover:border-red-200 hover:bg-red-50/70 hover:text-red-400"
            : "hover:border-red-300 hover:text-red-500",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4",
          isFavorite &&
            (isCompactLike
              ? "fill-red-400 text-red-400"
              : "fill-red-500 text-red-500")
        )}
        aria-hidden
      />
      <ClickLottieFeedback playToken={playToken} className="inset-0" />
    </Button>
  )
}
