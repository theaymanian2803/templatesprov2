import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Order } from '@/hooks/useOrders'
import { format } from 'date-fns'

interface OrderDetailsProps {
  order: Order | null
  onClose: () => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
}

export const OrderDetails = ({ order, onClose }: OrderDetailsProps) => {
  if (!order) return null

  return (
    <Dialog open={!!order} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails de la commande</span>
            <Badge className={statusColors[order.status]} variant="secondary">
              {order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">ID de commande</p>
              <p className="font-mono text-sm">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail du client</p>
              <p className="text-sm">{order.user_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Créée le</p>
              <p className="text-sm">
                {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
              <p className="text-sm">
                {format(new Date(order.updated_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-3">Articles commandés</h4>
            {order.items && order.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modèle</TableHead>
                    <TableHead>Licence</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.template_title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.license_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun article dans cette commande</p>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="font-medium">Montant total</span>
            <span className="text-xl font-bold">${order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
