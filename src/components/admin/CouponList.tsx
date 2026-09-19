import { useState } from "react";
import { Coupon, useCoupons, useCreateCoupon, useDeleteCoupon, useToggleCoupon } from "@/hooks/useCoupons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Trash2, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const CouponList = () => {
  const { data: coupons = [], isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const toggleCoupon = useToggleCoupon();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const handleCreate = async () => {
    if (!code.trim() || !discountValue) {
      toast({ title: "Veuillez remplir le code et la valeur de la réduction", variant: "destructive" });
      return;
    }
    try {
      await createCoupon.mutateAsync({
        code,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrder) || 0,
        max_uses: maxUses ? Number(maxUses) : null,
        expires_at: expiresAt || null,
      });
      toast({ title: "Code promo créé !" });
      setShowForm(false);
      setCode("");
      setDiscountValue("");
      setMinOrder("");
      setMaxUses("");
      setExpiresAt("");
    } catch (error: any) {
      toast({ title: "Erreur lors de la création du code promo", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon.mutateAsync(id);
      toast({ title: "Code promo supprimé !" });
    } catch (error: any) {
      toast({ title: "Erreur lors de la suppression du code promo", description: error.message, variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    try {
      await toggleCoupon.mutateAsync({ id, is_active });
    } catch (error: any) {
      toast({ title: "Erreur lors de la mise à jour du code promo", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Codes promo</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un code promo
          </Button>
        )}
      </div>

      {showForm && (
        <div className="glass-card p-6 rounded-2xl border border-border/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Code promo</Label>
              <Input
                placeholder="ex. SAVE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type de réduction</Label>
              <Select value={discountType} onValueChange={(v: "percentage" | "fixed") => setDiscountType(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                  <SelectItem value="fixed">Montant fixe ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valeur de la réduction</Label>
              <Input
                type="number"
                placeholder={discountType === "percentage" ? "ex. 20" : "ex. 10"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Montant minimum de commande ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Utilisations max (laisser vide pour illimité)</Label>
              <Input
                type="number"
                placeholder="Illimité"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Expire le (optionnel)</Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={createCoupon.isPending} className="gap-2">
              {createCoupon.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer le code promo
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun code promo pour l'instant</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Mini. commande</TableHead>
                <TableHead>Utilisation</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">{coupon.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : `$${coupon.discount_value}`}
                  </TableCell>
                  <TableCell>${coupon.min_order_amount}</TableCell>
                  <TableCell>
                    {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : " / ∞"}
                  </TableCell>
                  <TableCell>
                    {coupon.expires_at
                      ? format(new Date(coupon.expires_at), "MMM d, yyyy")
                      : "Jamais"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={(checked) => handleToggle(coupon.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le code promo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le code promo « {coupon.code} » ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(coupon.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
