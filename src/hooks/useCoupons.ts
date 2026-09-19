import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listCoupons, createCoupon, deleteCoupon, toggleCoupon, validateCoupon } from "@/server/functions/coupons"

export interface Coupon { id: string; code: string; discount_type: "percentage" | "fixed"; discount_value: number; min_order_amount: number; max_uses: number | null; used_count: number; is_active: boolean; expires_at: string | null; created_at: string }

export const useCoupons = () => useQuery({ queryKey: ["coupons"], queryFn: async () => listCoupons() })

export const useCreateCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: async (coupon: Partial<Coupon>) => { await createCoupon({ data: coupon }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }) })
}

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: async (id: string) => { await deleteCoupon({ data: id }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }) })
}

export const useToggleCoupon = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => { await toggleCoupon({ data: { id, is_active } }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }) })
}

export const useValidateCoupon = () => {
  return useMutation({ mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => validateCoupon({ data: { code, orderTotal } }) })
}
