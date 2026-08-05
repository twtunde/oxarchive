import { create } from "zustand"
import { persist } from "zustand/middleware"

type CartState = {
    ebookIds: string[]
    hasHydrated: boolean
    isInCart: (ebookId: string) => boolean
    addToCart: (ebookId: string) => void
    removeFromCart: (ebookId: string) => void
    toggleCartItem: (ebookId: string) => void
    clearCart: () => void
    setHasHydrated: (value: boolean) => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            ebookIds: [],
            hasHydrated: false,
            isInCart: (ebookId) => get().ebookIds.includes(ebookId),
            addToCart: (ebookId) =>
                set((state) => ({
                    ebookIds: state.ebookIds.includes(ebookId)
                        ? state.ebookIds
                        : [...state.ebookIds, ebookId],
                })),
            removeFromCart: (ebookId) =>
                set((state) => ({
                    ebookIds: state.ebookIds.filter((id) => id !== ebookId),
                })),
            toggleCartItem: (ebookId) =>
                set((state) => ({
                    ebookIds: state.ebookIds.includes(ebookId)
                        ? state.ebookIds.filter((id) => id !== ebookId)
                        : [...state.ebookIds, ebookId],
                })),
            clearCart: () => set({ ebookIds: [] }),
            setHasHydrated: (value) => set({ hasHydrated: value }),
        }),
        {
            name: "oxarchive-cart",
            // Rehydration is triggered manually so localStorage is never touched during SSR.
            skipHydration: true,
            partialize: (state) => ({ ebookIds: state.ebookIds }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
            },
        }
    )
)
