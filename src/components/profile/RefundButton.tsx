import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RefundButtonProps {
  orderId: string;
  orderStatus: string;
}

const statusConfig: Record<string, { icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { icon: Clock, variant: "outline", label: "Remboursement en attente" },
  approved: { icon: CheckCircle2, variant: "default", label: "Remboursement approuvé" },
  rejected: { icon: XCircle, variant: "destructive", label: "Remboursement refusé" },
};

const RefundButton = ({ orderId, orderStatus }: RefundButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data: existingRequest, isLoading } = useQuery({
    queryKey: ["refund-request", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refund_requests" as any)
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("refund_requests" as any)
        .insert({
          order_id: orderId,
          user_id: user!.id,
          reason,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refund-request", orderId] });
      toast({ title: "Demande de remboursement soumise", description: "Nous examinerons votre demande sous 1 à 3 jours ouvrés." });
      setOpen(false);
      setReason("");
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  if (orderStatus !== "completed") return null;
  if (isLoading) return <Loader2 className="w-3 h-3 animate-spin" />;

  if (existingRequest) {
    const config = statusConfig[existingRequest.status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <div className="flex flex-col items-end gap-1">
        <Badge variant={config.variant} className="gap-1">
          <Icon className="w-3 h-3" />
          {config.label}
        </Badge>
        {existingRequest.admin_notes && (
          <p className="text-xs text-muted-foreground max-w-[200px] text-right">
            {existingRequest.admin_notes}
          </p>
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1 text-xs">
          <RotateCcw className="w-3 h-3" />
          Demander un remboursement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demander un remboursement</DialogTitle>
          <DialogDescription>
            Veuillez nous indiquer pourquoi vous souhaitez un remboursement. Notre équipe examinera votre demande sous 1 à 3 jours ouvrés. 
            Les remboursements sont disponibles dans les 14 jours suivant l'achat conformément à notre politique de remboursement.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Veuillez décrire la raison de votre demande de remboursement..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!reason.trim() || submitMutation.isPending}
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Soumettre la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundButton;
