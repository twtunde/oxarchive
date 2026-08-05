import { create } from "zustand"
import { persist } from "zustand/middleware"

type FavoritesState = {
  favoriteIds: string[]
  hasHydrated: boolean
  isFavorite: (ebookId: string) => boolean
  toggleFavorite: (ebookId: string) => void
  setHasHydrated: (value: boolean) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      hasHydrated: false,
      isFavorite: (ebookId) => get().favoriteIds.includes(ebookId),
      toggleFavorite: (ebookId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(ebookId)
            ? state.favoriteIds.filter((id) => id !== ebookId)
            : [...state.favoriteIds, ebookId],
        })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "oxarchive-favorites",
      // Rehydration is triggered manually (see FavoritesHydrator) so localStorage
      // is never touched during server rendering.
      skipHydration: true,
      partialize: (state) => ({ favoriteIds: state.favoriteIds }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
