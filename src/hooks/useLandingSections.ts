import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminAddLandingSection,
  adminDeleteLandingSection,
  adminReorderLandingSections,
  adminUpdateLandingSection,
  listLandingSections,
} from '@/server/functions/landing'

export interface LandingSection {
  id: string
  section_key: string
  title: string
  subtitle: string
  image_url: string
  visible: boolean
  sort_order: number
  config: Record<string, any>
}

export type LandingSectionUpdates = Partial<
  Pick<LandingSection, 'visible' | 'title' | 'subtitle' | 'image_url' | 'config'>
>

export interface AddLandingSectionInput {
  type: string
  title: string
  subtitle?: string
  image_url?: string
  config?: Record<string, unknown>
}

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: ['landing-sections'] })

export const useLandingSections = () =>
  useQuery({
    queryKey: ['landing-sections'],
    queryFn: async () => listLandingSections() as unknown as LandingSection[],
  })

export const useUpdateLandingSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: LandingSectionUpdates }) => {
      await adminUpdateLandingSection({ data: { id, updates } as any })
    },
    onSuccess: () => invalidate(queryClient),
  })
}

export const useReorderLandingSections = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) => {
      await adminReorderLandingSections({ data: { ids } })
    },
    onSuccess: () => invalidate(queryClient),
  })
}

export const useAddLandingSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AddLandingSectionInput) => {
      await adminAddLandingSection({ data: input as any })
    },
    onSuccess: () => invalidate(queryClient),
  })
}

export const useDeleteLandingSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await adminDeleteLandingSection({ data: { id } })
    },
    onSuccess: () => invalidate(queryClient),
  })
}
