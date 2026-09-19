import { useState } from "react";
import { useMyOrders } from "@/hooks/useOrders";
import type { Order } from "@/hooks/useOrders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Package, ChevronDown, ChevronUp } from "lucide-react";
import RefundButton from "./RefundButton";
import { format } from "date-fns";
import OrderItemsList from "./OrderItemsList";

const statusVariant = (status: string) => {
  switch (status) {
    case "completed": return "default";
    case "processing": return "secondary";
    case "pending": return "outline";
    case "cancelled":
    case "refunded": return "destructive";
    default: return "outline";
  }
};

const OrderHistory = () => {
  const { data: orders, isLoading } = useMyOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrder = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Historique des commandes
        </CardTitle>
        <CardDescription>Vos achats passés et leur statut</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Aucune commande pour le moment</p>
            <p className="text-sm">Vos achats apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: Order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div key={order.id} className="rounded-lg border overflow-hidden">
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Commande nº {order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy 'à' h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                      <Badge variant={statusVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                      <RefundButton orderId={order.id} orderStatus={order.status} />
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <OrderItemsList orderId={order.id} orderStatus={order.status} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
