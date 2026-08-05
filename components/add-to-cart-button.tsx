"use client"

import { ShoppingBag, ShoppingBagIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { useSyncExternalStore } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/lib/stores/cart-store"
import { cn } from "@/lib/utils"

type AddToCartButtonProps = {
  ebookId: string
  className?: string
  size?: ComponentProps<typeof Button>["size"]
  variant?: ComponentProps<typeof Button>["variant"]
}

export function AddToCartButton({
  ebookId,
  className,
  size = "default",
  variant = "default",
}: AddToCartButtonProps) {
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
          "pointer-events-none min-w-28"
        )}
      />
    )
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={() => toggleCartItem(ebookId)}
      aria-pressed={isInCart}
    >
      {isInCart ? (
        <ShoppingBagIcon className="size-4" aria-hidden />
      ) : (
        <ShoppingBag className="size-4" aria-hidden />
      )}
      {label}
    </Button>
  )
}
