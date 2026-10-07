import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getMyLicenses, getMyPendingLicenses } from '@/server/functions/licenses'

export interface MyLicense {
  id: string
  template_id: string
  template_title: string
  product: string
  key: string
  order_id: string | null
  created_at: string
}

export const useMyLicenses = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['licenses', user?.id],
    queryFn: async () => (user ? getMyLicenses() : []),
    enabled: !!user,
  })
}

export const useMyPendingLicenses = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['licenses-pending', user?.id],
    queryFn: async () => (user ? getMyPendingLicenses() : []),
    enabled: !!user,
  })
}
