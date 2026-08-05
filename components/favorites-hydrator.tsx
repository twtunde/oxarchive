"use client"

import { useEffect } from "react"

import { useFavoritesStore } from "@/lib/stores/favorites-store"

export function FavoritesHydrator() {
  useEffect(() => {
    void useFavoritesStore.persist.rehydrate()
  }, [])

  return null
}
