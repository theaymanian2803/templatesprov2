import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PurchasedTemplate {
  id: string;
  template_id: string;
  template_title: string;
  license_type: string;
  price: number;
  purchased_at: string;
  order_id: string;
  order_status: string;
  source_file_url: string | null;
  has_review: boolean;
}

export const usePurchasedTemplates = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["purchased-templates", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("template_id")
        .eq("user_id", user.id);
      const reviewedSet = new Set((reviews || []).map((r) => r.template_id));

      // All-Access Pass holders get the whole catalog, including future templates
      const { data: passRes } = await supabase
        .from("all_access_passes")
        .select("id, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (passRes) {
        const [templatesRes, downloadsRes] = await Promise.all([
          supabase.from("templates").select("id, title, price"),
          supabase.from("template_downloads").select("template_id, source_file_url"),
        ]);

        const fileMap = new Map(
          (downloadsRes.data ?? []).map((d) => [d.template_id, d.source_file_url])
        );

        return (templatesRes.data ?? []).map((t) => ({
          id: `pass-${t.id}`,
          template_id: t.id,
          template_title: t.title,
          license_type: "pass",
          price: 0,
          purchased_at: passRes.created_at,
          order_id: `pass-${passRes.id}`,
          order_status: "completed",
          source_file_url: fileMap.get(t.id) ?? null,
          has_review: reviewedSet.has(t.id),
        })) as PurchasedTemplate[];
      }

      // Get completed orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, status, created_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      if (!orders?.length) return [];

      const orderIds = orders.map((o) => o.id);

      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;

      // Get download URLs
      const templateIds = [...new Set((items || []).map((i) => i.template_id))];
      const { data: downloads } = await supabase
        .from("template_downloads")
        .select("template_id, source_file_url")
        .in("template_id", templateIds);

      const fileMap = new Map(
        (downloads ?? []).map((d) => [d.template_id, d.source_file_url])
      );

      const orderMap = new Map(orders.map((o) => [o.id, o]));

      return (items || []).map((item) => ({
        id: item.id,
        template_id: item.template_id,
        template_title: item.template_title,
        license_type: item.license_type,
        price: item.price,
        purchased_at: orderMap.get(item.order_id)?.created_at || item.created_at,
        order_id: item.order_id,
        order_status: orderMap.get(item.order_id)?.status || "completed",
        source_file_url: fileMap.get(item.template_id) ?? null,
        has_review: reviewedSet.has(item.template_id),
      })) as PurchasedTemplate[];
    },
    enabled: !!user,
  });
};

export const useDashboardStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      if (!user) return { totalOrders: 0, totalSpent: 0, totalDownloads: 0, pendingReviews: 0 };

      const [ordersRes, itemsRes, reviewsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total_amount, status")
          .eq("user_id", user.id),
        supabase
          .from("order_items")
          .select("template_id, order_id")
          .in(
            "order_id",
            (await supabase.from("orders").select("id").eq("user_id", user.id).eq("status", "completed")).data?.map((o) => o.id) || []
          ),
        supabase
          .from("reviews")
          .select("template_id")
          .eq("user_id", user.id),
      ]);

      const completedOrders = (ordersRes.data || []).filter((o) => o.status === "completed");
      const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const purchasedTemplateIds = new Set((itemsRes.data || []).map((i) => i.template_id));
      const reviewedIds = new Set((reviewsRes.data || []).map((r) => r.template_id));
      const pendingReviews = [...purchasedTemplateIds].filter((id) => !reviewedIds.has(id)).length;

      const { count: catalogCount } = await supabase
        .from("templates")
        .select("id", { count: "exact", head: true });

      const { data: passRes } = await supabase
        .from("all_access_passes")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      return {
        totalOrders: (ordersRes.data || []).length,
        totalSpent,
        totalDownloads: passRes ? catalogCount ?? 0 : purchasedTemplateIds.size,
        pendingReviews: passRes ? 0 : pendingReviews,
      };
    },
    enabled: !!user,
  });
};
