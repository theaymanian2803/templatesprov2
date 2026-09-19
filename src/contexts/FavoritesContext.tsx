import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { listFavorites, toggleFavorite as toggleFavoriteFn } from "@/server/functions/favorites"

interface FavoritesContextType {
  favorites: string[]
  loading: boolean
  toggleFavorite: (templateId: string) => Promise<void>
  isFavorite: (templateId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setLoading(true)
      listFavorites()
        .then((ids) => {
          setFavorites(ids)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setFavorites([])
    }
  }, [user])

  const toggleFavorite = async (templateId: string) => {
    if (!user) return
    const res = await toggleFavoriteFn({ data: templateId })
    if (res.isFavorite) setFavorites((prev) => [...prev, templateId])
    else setFavorites((prev) => prev.filter((id) => id !== templateId))
  }

  const isFavorite = (templateId: string) => favorites.includes(templateId)

  return <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) throw new Error("useFavorites must be used within a FavoritesProvider")
  return context
}
