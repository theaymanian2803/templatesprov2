import { Bell, Package, Sparkles, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const NotificationBell = () => {
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const iconForType = (type: string) => {
    switch (type) {
      case "order_status":
        return <Package className="w-4 h-4 text-primary shrink-0" />;
      case "new_template":
        return <Sparkles className="w-4 h-4 text-accent shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 bg-background border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead.mutate()}
            >
              <Check className="w-3 h-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Chargement…</div>
          ) : !notifications?.length ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucune notification pour l'instant
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead.mutate(n.id)}
                  className={cn(
                    "w-full text-left flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                    !n.is_read && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5">{iconForType(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.is_read ? "font-semibold text-foreground" : "text-foreground/80")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
