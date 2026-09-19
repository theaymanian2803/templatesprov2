import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Eye, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { variant: "outline", icon: Clock },
  approved: { variant: "default", icon: CheckCircle2 },
  rejected: { variant: "destructive", icon: XCircle },
};

const RefundRequestList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-refund-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refund_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch order details and user emails
      const items = data as any[];
      const orderIds = [...new Set(items.map((r: any) => r.order_id))];
      const { data: orders } = await supabase
        .from("orders")
        .select("id, user_email, total_amount")
        .in("id", orderIds);

      const orderMap = new Map((orders || []).map(o => [o.id, o]));

      return items.map((r: any) => ({
        ...r,
        user_email: orderMap.get(r.order_id)?.user_email || "Unknown",
        order_total: orderMap.get(r.order_id)?.total_amount || 0,
      }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes: string }) => {
      const { error } = await supabase
        .from("refund_requests" as any)
        .update({ status, admin_notes } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refund-requests"] });
      toast({ title: "Demande de remboursement mise à jour !" });
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("refund_requests" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refund-requests"] });
      toast({ title: "Demande de remboursement supprimée !" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filtered = (requests || []).filter((r: any) =>
    r.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par e-mail, motif ou ID de commande..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {!filtered.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune demande de remboursement trouvée.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r: any) => {
                const config = statusConfig[r.status] || statusConfig.pending;
                const Icon = config.icon;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{r.user_email}</TableCell>
                    <TableCell className="text-xs font-mono">{r.order_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-sm">${Number(r.order_total).toFixed(2)}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{r.reason}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1 capitalize">
                        <Icon className="w-3 h-3" />
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedRequest(r);
                            setNewStatus(r.status);
                            setAdminNotes(r.admin_notes || "");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la demande de remboursement ?</AlertDialogTitle>
                              <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(r.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Examiner la demande de remboursement</DialogTitle>
            <DialogDescription>
              De {selectedRequest?.user_email} · Commande #{selectedRequest?.order_id.slice(0, 8)} · ${Number(selectedRequest?.order_total || 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Motif du client</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedRequest?.reason}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvée</SelectItem>
                  <SelectItem value="rejected">Rejetée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Notes d'administration (visibles par l'utilisateur)</p>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ajoutez une note concernant cette décision de remboursement..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Annuler</Button>
            <Button
              onClick={() => updateMutation.mutate({ id: selectedRequest.id, status: newStatus, admin_notes: adminNotes })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundRequestList;
