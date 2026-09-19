import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { hasAllAccessPass } from "@/server/functions/orders"

export const ALL_ACCESS_PRICE = 300

export const useAllAccessPass = () => {
  const { user } = useAuth()
  return useQuery({ queryKey: ["all-access-pass", user?.id], queryFn: async () => hasAllAccessPass(), enabled: !!user })
}
