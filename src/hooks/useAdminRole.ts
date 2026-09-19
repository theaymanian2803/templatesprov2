import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getIsAdmin } from '@/server/functions/admin'

export const useAdminRole = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => (user?.id ? getIsAdmin() : false),
    enabled: !!user?.id,
  })
}
