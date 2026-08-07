"use client"

import { ShoppingBag, ShoppingBagIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { useState, useSyncExternalStore } from "react"

import { ClickLottieFeedback } from "@/components/click-lottie-feedback"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/lib/stores/cart-store"
import { cn } from "@/lib/utils"

type AddToCartButtonProps = {
  ebookId: string
  className?: string
  size?: ComponentProps<typeof Button>["size"]
  variant?: ComponentProps<typeof Button>["variant"]
  iconOnly?: boolean
}

export function AddToCartButton({
  ebookId,
  className,
  size = "default",
  variant = "default",
  iconOnly = false,
}: AddToCartButtonProps) {
  const [playToken, setPlayToken] = useState(0)
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const isInCart = useCartStore((state) => state.isInCart(ebookId))
  const toggleCartItem = useCartStore((state) => state.toggleCartItem)

  const label = isInCart ? "Remove from bag" : "Add to bag"
  const isReady = isMounted && hasHydrated

  if (!isReady) {
    return (
      <Skeleton
        aria-hidden
        className={cn(
          buttonVariants({ variant, size, className }),
          "pointer-events-none",
          !iconOnly && "min-w-28"
        )}
      />
    )
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(
        "relative overflow-visible transition-colors",
        iconOnly
          ? isInCart
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 dark:border-amber-300 dark:bg-amber-50/20 dark:text-amber-300 dark:hover:border-amber-200 dark:hover:bg-amber-100/25"
            : "text-muted-foreground hover:border-foreground/20 hover:bg-muted/70 hover:text-foreground"
          : isInCart
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100 dark:border-amber-300 dark:bg-amber-50/20 dark:text-amber-300 dark:hover:border-amber-200 dark:hover:bg-amber-100/25"
            : undefined,
        className
      )}
      onClick={() => {
        setPlayToken((value) => value + 1)
        toggleCartItem(ebookId)
      }}
      aria-pressed={isInCart}
      aria-label={label}
      title={label}
    >
      {isInCart ? (
        <ShoppingBagIcon className="size-4" aria-hidden />
      ) : (
        <ShoppingBag className="size-4" aria-hidden />
      )}
      {iconOnly ? <span className="sr-only">{label}</span> : label}
      <ClickLottieFeedback playToken={playToken} className="-inset-1" />
    </Button>
  )
}
