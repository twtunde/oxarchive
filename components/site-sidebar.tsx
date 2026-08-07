"use client"

import { BookMarked, Heart, LayoutGrid, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { useCartStore } from "@/lib/stores/cart-store"
import { useFavoritesStore } from "@/lib/stores/favorites-store"

const NAV_ITEMS = [
  { href: "/", label: "Featured", icon: BookMarked },
  { href: "/catalog", label: "All books", icon: LayoutGrid },
]

export function SiteSidebar() {
  const hasCartHydrated = useCartStore((state) => state.hasHydrated)
  const cartCount = useCartStore((state) => state.ebookIds.length)
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated)
  const favoritesCount = useFavoritesStore((state) => state.favoriteIds.length)

  return (
    <aside className="hidden h-full w-20 shrink-0 flex-col items-center justify-between bg-sidebar py-6 text-sidebar-foreground md:flex">
      <Link
        href="/"
        aria-label="Oxarchive home"
        className="rounded-md transition-opacity hover:opacity-90"
      >
        <Image
          src="/logo.svg"
          alt="Oxarchive"
          width={34}
          height={47}
          priority
        />
      </Link>

      <nav className="flex flex-col items-center gap-1 border-y border-sidebar-border py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            title={label}
            className="flex size-11 items-center justify-center rounded-full transition hover:bg-sidebar-accent"
          >
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">{label}</span>
          </Link>
        ))}

        <Link
          href="/cart"
          title="Bag"
          className="relative flex size-11 items-center justify-center rounded-full transition hover:bg-sidebar-accent"
        >
          <ShoppingBag className="size-4" aria-hidden />
          <span className="sr-only">Bag</span>
          {hasCartHydrated && cartCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-sidebar-primary text-[9px] font-semibold text-sidebar-primary-foreground">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          ) : null}
        </Link>

        <Link
          href="/favorites"
          title="Favourites"
          className="relative flex size-11 items-center justify-center rounded-full transition hover:bg-sidebar-accent"
        >
          <Heart className="size-4" aria-hidden />
          <span className="sr-only">Favourites</span>
          {hasHydrated && favoritesCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-sidebar-primary text-[9px] font-semibold text-sidebar-primary-foreground">
              {favoritesCount > 9 ? "9+" : favoritesCount}
            </span>
          ) : null}
        </Link>
      </nav>

      <span className="text-[10px] tracking-widest text-sidebar-foreground/40 [writing-mode:vertical-lr]">
        EST. 2026
      </span>
    </aside>
  )
}
