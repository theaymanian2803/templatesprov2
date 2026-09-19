import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  extended_price: number | null;
  image_url: string;
  gallery_images: string[];
  rating: number;
  sales: number;
  review_count?: number;
  featured: boolean;
  tech_stack: string[];
  features: string[];
  demo_url: string | null;
  source_file_url?: string | null; // stored in template_downloads, not in templates table
  youtube_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UseTemplatesOptions {
  featured?: boolean;
  category?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
}

interface PaginatedTemplates {
  data: Template[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const useTemplates = (options?: UseTemplatesOptions) => {
  return useQuery({
    queryKey: ["templates", options],
    queryFn: async () => {
      let query = supabase.from("templates").select("*");
      
      if (options?.featured) {
        query = query.eq("featured", true);
      }
      
      if (options?.category) {
        query = query.eq("category", options.category);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      query = query.order("sales", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Template[];
    },
  });
};

export const useTemplatesPaginated = (options?: UseTemplatesOptions) => {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 9;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return useQuery({
    queryKey: ["templates-paginated", options],
    queryFn: async () => {
      // First get the count
      let countQuery = supabase.from("templates").select("*", { count: "exact", head: true });
      
      if (options?.featured) {
        countQuery = countQuery.eq("featured", true);
      }
      
      if (options?.category) {
        countQuery = countQuery.eq("category", options.category);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;

      // Then get the paginated data
      let query = supabase.from("templates").select("*");
      
      if (options?.featured) {
        query = query.eq("featured", true);
      }
      
      if (options?.category) {
        query = query.eq("category", options.category);
      }
      
      query = query.order("sales", { ascending: false }).range(from, to);
      
      const { data, error } = await query;
      
      if (error) throw error;

      const totalCount = count || 0;
      
      return {
        data: data as Template[],
        count: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      } as PaginatedTemplates;
    },
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Template | null;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["template-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("category");
      
      if (error) throw error;
      
      const categories = [...new Set(data.map(t => t.category))];
      return categories;
    },
  });
};
