import { createFileRoute } from '@tanstack/react-router'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
} from '@/hooks/useNotifications'
import { Bell, Crown, Package, Rocket } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Link } from '@/lib/router'

const typeIcon: Record<string, React.ElementType> = {
  order: Package,
  all_access: Crown,
  pro_hosting: Rocket,
}

const Notifications = () => {
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const { data: notifications, isLoading } = useMyNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const hasUnread = (notifications ?? []).some((n) => !n.is_read)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {t('notifications.title')}
              </h1>
              <p className="text-muted-foreground mt-1">{t('notifications.subtitle')}</p>
            </div>
            {user && hasUnread && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}>
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>

          {authLoading || (user && isLoading) ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !user ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">{t('notifications.signInPrompt')}</p>
                <Link to="/auth">
                  <Button>{t('nav.signIn')}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (notifications ?? []).length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('notifications.empty')}</h3>
                <p className="text-sm text-muted-foreground">{t('notifications.emptyDesc')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications!.map((n) => {
                const Icon = typeIcon[n.type] ?? Bell
                return (
                  <Card
                    key={n.id}
                    className={`border-border/50 transition-colors ${!n.is_read ? 'border-primary/30 bg-primary/5' : ''}`}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-label={t('notifications.unread')} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {format(new Date(n.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      {!n.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-xs"
                          onClick={() => markRead.mutate(n.id)}
                          disabled={markRead.isPending}>
                          {t('notifications.markRead')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

export const Route = createFileRoute('/notifications')({ component: Notifications })
