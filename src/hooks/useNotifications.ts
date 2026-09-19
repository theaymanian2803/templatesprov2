import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { listNotifications, markAsRead, markAllAsRead } from "@/server/functions/notifications"

export interface Notification { id: string; user_id: string; type: string; title: string; message: string; is_read: boolean; metadata: Record<string, any>; created_at: string }

export const useNotifications = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["notifications", user?.id], queryFn: async () => listNotifications(), enabled: !!user, refetchInterval: 30000 })
}

export const useUnreadCount = () => {
  const { data: notifications } = useNotifications()
  return notifications?.filter((n) => !n.is_read).length ?? 0
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({ mutationFn: async (id: string) => { await markAsRead({ data: id }) }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }) })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({ mutationFn: async () => { await markAllAsRead() }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }) })
}
