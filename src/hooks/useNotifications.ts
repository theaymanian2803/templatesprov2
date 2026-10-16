import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyUnreadNotificationCount,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/server/functions/notifications'

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: Date | string
}

export const useMyNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: async () => listMyNotifications() as unknown as AppNotification[] })

export const useUnreadNotificationCount = (enabled = true) =>
  useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => getMyUnreadNotificationCount(),
    enabled,
    refetchInterval: 60_000,
  })

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await markNotificationRead({ data: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await markAllNotificationsRead()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}
