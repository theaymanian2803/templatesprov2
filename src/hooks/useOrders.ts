import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMyOrders, getOrderWithItems } from "@/server/functions/orders"
import { adminUpdateOrderStatus, adminDeleteOrder, adminListOrders } from "@/server/functions/admin"

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded"
export interface OrderItem { id: string; order_id: string; template_id: string; template_title: string; license_type: string; price: number; created_at: Date }
export interface Order { id: string; user_id: string; user_email: string; status: OrderStatus; total_amount: number; paypal_order_id: string | null; created_at: Date; updated_at: Date; items?: OrderItem[] }

export const useOrders = () => {
  return useQuery({ queryKey: ["orders"], queryFn: async () => getMyOrders() as unknown as Order[] })
}

export const useMyOrders = useOrders

/** All orders across every customer — admin only. */
export const useAdminOrders = () => {
  return useQuery({ queryKey: ["admin-orders"], queryFn: async () => adminListOrders() as unknown as Order[] })
}

export const useOrderWithItems = (orderId: string) => {
  return useQuery({ queryKey: ["order", orderId], queryFn: async () => getOrderWithItems({ data: orderId }) as unknown as Order, enabled: !!orderId })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => { await adminUpdateOrderStatus({ data: { orderId, status } }) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
  })
}

export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: string) => { await adminDeleteOrder({ data: orderId }) },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
  })
}
