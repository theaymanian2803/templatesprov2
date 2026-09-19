import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { listReviews, getUserReview, hasPurchased, submitReview, deleteReview } from "@/server/functions/reviews"

export interface Review { id: string; user_id: string; template_id: string; rating: number; comment: string | null; created_at: string; updated_at: string; display_name?: string; avatar_url?: string | null }

export const useReviews = (templateId: string) => {
  return useQuery({ queryKey: ["reviews", templateId], queryFn: async () => listReviews({ data: templateId }), enabled: !!templateId })
}

export const useUserReview = (templateId: string) => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["user-review", templateId, user?.id], queryFn: async () => (user ? getUserReview({ data: templateId }) : null), enabled: !!templateId && !!user })
}

export const useHasPurchased = (templateId: string) => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["has-purchased", templateId, user?.id], queryFn: async () => (user ? hasPurchased({ data: templateId }) : false), enabled: !!templateId && !!user })
}

export const useSubmitReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ templateId, rating, comment }: { templateId: string; rating: number; comment: string }) => { await submitReview({ data: { templateId, rating, comment } }) },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["template", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
    },
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ reviewId, templateId }: { reviewId: string; templateId: string }) => { await deleteReview({ data: { reviewId, templateId } }) },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["template", variables.templateId] })
      queryClient.invalidateQueries({ queryKey: ["templates"] })
      queryClient.invalidateQueries({ queryKey: ["templates-paginated"] })
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] })
    },
  })
}
