import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRefundRequest, getRefundRequestByOrder } from "@/server/functions/refunds";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
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

const RefundButton = ({ orderId, orderStatus }: RefundButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const statusConfig: Record<string, { icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { icon: Clock, variant: "outline", label: t("refund.pending") },
    approved: { icon: CheckCircle2, variant: "default", label: t("refund.approved") },
    rejected: { icon: XCircle, variant: "destructive", label: t("refund.rejected") },
  };

  const { data: existingRequest, isLoading } = useQuery({
    queryKey: ["refund-request", orderId],
    queryFn: async () => getRefundRequestByOrder({ data: orderId }),
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await createRefundRequest({ data: { orderId, reason } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refund-request", orderId] });
      toast({ title: t("refund.submittedTitle"), description: t("refund.submittedDesc") });
      setOpen(false);
      setReason("");
    },
    onError: (error: any) => {
      toast({ title: t("refund.error"), description: error.message, variant: "destructive" });
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
          {t("refund.request")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("refund.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("refund.dialogDesc")}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={t("refund.placeholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("refund.cancel")}</Button>
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!reason.trim() || submitMutation.isPending}
          >
            {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("refund.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundButton;
