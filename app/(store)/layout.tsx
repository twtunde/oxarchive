import { CartHydrator } from "@/components/cart-hydrator"
import { FavoritesHydrator } from "@/components/favorites-hydrator"
import { MobileNavDock } from "@/components/mobile-nav-dock"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SiteSidebar } from "@/components/site-sidebar"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <FavoritesHydrator />
      <CartHydrator />
      <SiteSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto pb-28 md:pb-0">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <MobileNavDock />
    </div>
  )
}
