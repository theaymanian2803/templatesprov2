import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { getPurchasedTemplates, getDashboardStats } from "@/server/functions/dashboard"

export interface PurchasedTemplate { id: string; template_id: string; template_title: string; license_type: string; price: number; purchased_at: string; order_id: string; order_status: string; source_file_url: string | null; has_review: boolean }

export const usePurchasedTemplates = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["purchased-templates", user?.id], queryFn: async () => (user ? getPurchasedTemplates() : []), enabled: !!user })
}

export const useDashboardStats = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["dashboard-stats", user?.id], queryFn: async () => (user ? getDashboardStats() : { totalOrders: 0, totalSpent: 0, totalDownloads: 0, pendingReviews: 0 }), enabled: !!user })
}
