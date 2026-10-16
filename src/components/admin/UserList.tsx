import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminListUsers, adminSetUserRole } from '@/server/functions/admin'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, Search, Users } from 'lucide-react'
import { format } from 'date-fns'

type Role = 'admin' | 'moderator' | 'user'

interface AdminUser {
  id: string
  name: string
  email: string
  created_at: Date | string
  role: Role
}

const roleBadge: Record<Role, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  moderator: 'secondary',
  user: 'outline',
}

export const UserList = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => adminListUsers() as unknown as AdminUser[],
  })

  const [search, setSearch] = useState('')
  const [pending, setPending] = useState<{ user: AdminUser; role: Role } | null>(null)

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      await adminSetUserRole({ data: { userId, role } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'Role updated' })
      setPending(null)
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update role', description: error.message, variant: 'destructive' })
      setPending(null)
    },
  })

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.name ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  )

  const handleRoleChange = (target: AdminUser, role: Role) => {
    if (role === target.role) return
    if (target.id === user?.id) {
      toast({ title: "You can't change your own role", variant: 'destructive' })
      return
    }
    setPending({ user: target, role })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Change role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {u.name || '—'}
                      {u.id === user?.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(u.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadge[u.role]} className="capitalize">{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRoleChange(u, v as Role)}
                      disabled={u.id === user?.id}>
                      <SelectTrigger className="w-[150px] ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change role</AlertDialogTitle>
            <AlertDialogDescription>
              {pending && (
                <>
                  Change <strong>{pending.user.email}</strong>&apos;s role to{' '}
                  <strong className="capitalize">{pending.role}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pending && setRole.mutate({ userId: pending.user.id, role: pending.role })
              }
              disabled={setRole.isPending}>
              {setRole.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default UserList
