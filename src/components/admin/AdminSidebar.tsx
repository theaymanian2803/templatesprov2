import {
  LayoutTemplate,
  ShoppingCart,
  Tag,
  MessageCircle,
  Star,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const managementItems = [
  { title: "Modèles", value: "templates", icon: LayoutTemplate },
  { title: "Commandes", value: "orders", icon: ShoppingCart },
  { title: "Codes promo", value: "coupons", icon: Tag },
  { title: "Avis", value: "reviews", icon: Star },
  { title: "Messages", value: "contacts", icon: MessageCircle },
  { title: "Remboursements", value: "refunds", icon: RotateCcw },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderGroup = (label: string, items: typeof managementItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.value}>
              <SidebarMenuButton
                onClick={() => handleTabChange(item.value)}
                className={cn(
                  "w-full cursor-pointer transition-colors",
                  activeTab === item.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50"
                )}
                tooltip={collapsed ? item.title : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 top-16 h-[calc(100vh-4rem)]">
      <SidebarContent className="pt-4">
        {!collapsed && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Admin</span>
          </div>
        )}
        {renderGroup("Gestion", managementItems)}
      </SidebarContent>
    </Sidebar>
  );
};
