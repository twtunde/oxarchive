"use client"

import { BookMarked, Heart, LayoutGrid, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useCartStore } from "@/lib/stores/cart-store"
import { useFavoritesStore } from "@/lib/stores/favorites-store"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Featured", icon: BookMarked },
  { href: "/catalog", label: "All books", icon: LayoutGrid },
  { href: "/cart", label: "Bag", icon: ShoppingBag },
  { href: "/favorites", label: "Favourites", icon: Heart },
]

export function MobileNavDock() {
  const pathname = usePathname()
  const hasCartHydrated = useCartStore((state) => state.hasHydrated)
  const cartCount = useCartStore((state) => state.ebookIds.length)
  const hasFavoritesHydrated = useFavoritesStore((state) => state.hasHydrated)
  const favoritesCount = useFavoritesStore((state) => state.favoriteIds.length)

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }

    if (href === "/catalog") {
      return pathname === "/catalog" || pathname.startsWith("/ebooks/")
    }

    if (href === "/cart") {
      return pathname === "/cart" || pathname.startsWith("/checkout/")
    }

    return pathname === href
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-3 z-40 mx-auto w-[calc(100%-1rem)] max-w-md rounded-2xl border border-border/70 bg-background/90 px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-4 gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = isActiveLink(href)
          const badgeCount =
            href === "/cart"
              ? hasCartHydrated
                ? cartCount
                : null
              : href === "/favorites"
                ? hasFavoritesHydrated
                  ? favoritesCount
                  : null
                : null

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4" aria-hidden />
                <span>{label}</span>
                {badgeCount !== null ? (
                  <span
                    className={cn(
                      "absolute top-2 right-2 flex min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-4 font-semibold",
                      badgeCount > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
