import { useQuery } from "@tanstack/react-query"
import { listTemplates, listTemplatesPaginated, getTemplate, getCategories } from "@/server/functions/templates"

export interface Template {
  id: string; title: string; description: string | null; admin_description?: string | null; category: string
  price: number; extended_price: number | null; image_url: string
  gallery_images: string[]; rating: number; sales: number; review_count?: number
  featured: boolean; tech_stack: string[]; features: string[]; demo_url: string | null
  source_file_url?: string | null; youtube_id: string | null; license_product?: string | null; created_at: string; updated_at: string
  download_count: number
}

interface UseTemplatesOptions { featured?: boolean; category?: string; limit?: number; page?: number; pageSize?: number }

export const useTemplates = (options?: UseTemplatesOptions) => {
  return useQuery({
    queryKey: ["templates", options],
    queryFn: async () => listTemplates({ data: { featured: options?.featured, category: options?.category, limit: options?.limit } }),
  })
}

export const useTemplatesPaginated = (options?: UseTemplatesOptions) => {
  return useQuery({
    queryKey: ["templates-paginated", options],
    queryFn: async () => listTemplatesPaginated({ data: { featured: options?.featured, category: options?.category, page: options?.page || 1, pageSize: options?.pageSize || 9 } }),
  })
}

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => getTemplate({ data: id }),
    enabled: !!id,
  })
}

export const useCategories = () => {
  return useQuery({ queryKey: ["template-categories"], queryFn: async () => getCategories() })
}
