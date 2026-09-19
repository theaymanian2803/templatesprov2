import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Partial<Coupon>) => {
      const { error } = await supabase.from("coupons").insert([{
        code: coupon.code!.toUpperCase().trim(),
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value || 0,
        min_order_amount: coupon.min_order_amount || 0,
        max_uses: coupon.max_uses || null,
        is_active: coupon.is_active ?? true,
        expires_at: coupon.expires_at || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useToggleCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ code, orderTotal }: { code: string; orderTotal: number }) => {
      const { data, error } = await supabase.rpc("validate_coupon" as any, {
        coupon_code: code.toUpperCase().trim(),
        order_total: orderTotal,
      });

      if (error) throw new Error("Failed to validate coupon");

      const result = data as any;
      if (!result?.valid) {
        throw new Error(result?.error || "Invalid coupon code");
      }

      return {
        coupon: {
          code: result.code,
          discount_type: result.discount_type,
          discount_value: result.discount_value,
        },
        discount: Math.round(result.discount * 100) / 100,
      };
    },
  });
};
