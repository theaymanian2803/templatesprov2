import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const ALL_ACCESS_PRICE = 300;

export const useAllAccessPass = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-access-pass", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("all_access_passes")
        .select("*")
        .eq("user_id", user!.id)
        .limit(1);

      if (error) throw error;
      return data.length > 0 ? data[0] : null;
    },
    enabled: !!user,
  });
};
