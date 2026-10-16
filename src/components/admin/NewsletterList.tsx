import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminDeleteNewsletterSubscriber, adminListNewsletterSubscribers } from '@/server/functions/newsletter'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
} from '@/components/ui/alert-dialog'
import { Loader2, Search, Trash2, Mail } from 'lucide-react'
import { format } from 'date-fns'

interface Subscriber {
  id: string
  email: string
  created_at: Date | string
}

export const NewsletterList = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['admin-newsletter'],
    queryFn: async () => adminListNewsletterSubscribers() as unknown as Subscriber[],
  })
  const [search, setSearch] = useState('')

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await adminDeleteNewsletterSubscriber({ data: id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter'] })
      toast({ title: 'Subscriber removed' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove subscriber', description: error.message, variant: 'destructive' })
    },
  })

  const filtered = useMemo(
    () => subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase())),
    [subscribers, search],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search subscribers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">{subscribers.length} total</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No subscribers yet</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(s.created_at), 'MMM d, yyyy')}
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
                          <AlertDialogTitle>Remove subscriber</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove &ldquo;{s.email}&rdquo; from the newsletter list?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove.mutate(s.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove
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
  )
}

export default NewsletterList
