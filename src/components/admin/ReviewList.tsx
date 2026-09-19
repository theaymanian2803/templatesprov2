import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, Trash2, Search, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AdminReview {
  id: string;
  user_id: string;
  template_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  status: string;
  display_name: string;
  template_title: string;
}

const useAdminReviews = () => {
  return useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((reviews || []).map((r: any) => r.user_id))];
      const templateIds = [...new Set((reviews || []).map((r: any) => r.template_id))];

      const [profilesRes, templatesRes] = await Promise.all([
        userIds.length > 0
          ? supabase.from("profiles").select("user_id, display_name").in("user_id", userIds)
          : { data: [] },
        templateIds.length > 0
          ? supabase.from("templates").select("id, title").in("id", templateIds)
          : { data: [] },
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.user_id, p.display_name]));
      const templateMap = new Map((templatesRes.data || []).map((t: any) => [t.id, t.title]));

      return (reviews || []).map((r: any) => ({
        ...r,
        display_name: profileMap.get(r.user_id) || "Anonymous",
        template_title: templateMap.get(r.template_id) || "Unknown Template",
      })) as AdminReview[];
    },
  });
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "secondary", icon: <Clock className="w-3 h-3" /> },
  approved: { label: "Approved", variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Rejected", variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
};

export const ReviewList = () => {
  const { data: reviews = [], isLoading } = useAdminReviews();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["template"] });
      toast({ title: "Statut de l'avis mis à jour" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur lors de la mise à jour de l'avis", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["template"] });
      toast({ title: "Avis supprimé avec succès" });
      setDeletingId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur lors de la suppression de l'avis", description: error.message, variant: "destructive" });
      setDeletingId(null);
    },
  });

  const handleBulkAction = async (action: "approved" | "rejected" | "delete") => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      if (action === "delete") {
        const { error } = await supabase.from("reviews").delete().in("id", ids);
        if (error) throw error;
        toast({ title: `${ids.length} avis${ids.length > 1 ? "" : ""} supprimé${ids.length > 1 ? "s" : ""}` });
      } else {
        const { error } = await supabase.from("reviews").update({ status: action }).in("id", ids);
        if (error) throw error;
        toast({ title: `${ids.length} avis ${action === "approved" ? "approuvé" : "rejeté"}${ids.length > 1 ? "s" : ""}` });
      }
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["templates-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["template"] });
    } catch (error: any) {
      toast({ title: "Action groupée échouée", description: error.message, variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.template_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-yellow-600">
            {pendingCount} avis en attente d'approbation
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher des avis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions bar */}
      {someSelected && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-green-600 border-green-600/30 hover:bg-green-600/10"
              onClick={() => handleBulkAction("approved")}
              disabled={bulkLoading}
            >
              {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Tout approuver
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
              onClick={() => handleBulkAction("rejected")}
              disabled={bulkLoading}
            >
              {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Tout rejeter
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={bulkLoading}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Tout supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer {selectedIds.size} avis</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cela supprimera définitivement {selectedIds.size} avis sélectionné{selectedIds.size > 1 ? "s" : ""}. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkAction("delete")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer {selectedIds.size} avis
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} disabled={bulkLoading}>
              Effacer
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || statusFilter !== "all" ? "Aucun avis ne correspond à vos filtres." : "Aucun avis pour l'instant."}
        </div>
      ) : (
        <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Commentaire</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((review) => {
                const cfg = statusConfig[review.status] || statusConfig.pending;
                return (
                  <TableRow key={review.id} className={review.status === "pending" ? "bg-yellow-500/5" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(review.id)}
                        onCheckedChange={() => toggleSelect(review.id)}
                        aria-label={`Sélectionner l'avis de ${review.display_name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{review.display_name}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{review.template_title}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cfg.variant} className="gap-1">
                        {cfg.icon} {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[250px] truncate text-muted-foreground text-sm">
                      {review.comment || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {review.status !== "approved" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => updateStatusMutation.mutate({ id: review.id, status: "approved" })}
                            title="Approuver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {review.status !== "rejected" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-orange-500 hover:text-orange-600"
                            onClick={() => updateStatusMutation.mutate({ id: review.id, status: "rejected" })}
                            title="Rejeter"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" disabled={deletingId === review.id}>
                              {deletingId === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'avis</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cela supprimera définitivement l'avis de {review.display_name} sur « {review.template_title} ».
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(review.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Supprimer
                                </AlertDialogAction>
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
    </div>
  );
};
