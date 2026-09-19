import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Review {
  id: string;
  user_id: string;
  template_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  display_name?: string;
  avatar_url?: string;
}

export const useReviews = (templateId: string) => {
  return useQuery({
    queryKey: ["reviews", templateId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("template_id", templateId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for display names
      const userIds = [...new Set((reviews || []).map((r: any) => r.user_id))];
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);
        profiles = data || [];
      }

      const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));

      return (reviews || []).map((r: any) => ({
        ...r,
        display_name: profileMap.get(r.user_id)?.display_name || "Anonymous",
        avatar_url: profileMap.get(r.user_id)?.avatar_url || null,
      })) as Review[];
    },
    enabled: !!templateId,
  });
};

export const useUserReview = (templateId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-review", templateId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("template_id", templateId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!templateId && !!user,
  });
};

export const useHasPurchased = (templateId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["has-purchased", templateId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("order_items")
        .select("id, order_id")
        .eq("template_id", templateId);

      if (error) throw error;
      if (!data || data.length === 0) return false;

      // Check if any of these orders belong to the user and are completed
      const orderIds = data.map((item: any) => item.order_id);
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .in("id", orderIds)
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (ordersError) throw ordersError;
      return (orders || []).length > 0;
    },
    enabled: !!templateId && !!user,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      rating,
      comment,
    }: {
      templateId: string;
      rating: number;
      comment: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("reviews").upsert(
        {
          user_id: user.id,
          template_id: templateId,
          rating,
          comment: comment.trim() || null,
        },
        { onConflict: "user_id,template_id" }
      );
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ["template", variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, templateId }: { reviewId: string; templateId: string }) => {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ["template", variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
};
