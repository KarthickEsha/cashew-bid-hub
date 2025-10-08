import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import {
  Home,
  Store,
  FileText,
  MessageSquare,
  Plus,
  Bell,
  User,
  Mail
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClerk } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useResponses } from "@/hooks/useResponses";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useTranslation } from "react-i18next";
import { useOrders } from "@/hooks/useOrders";
import { useRequirements } from "@/hooks/useRequirements";
import { apiFetch } from "@/lib/api";
import { ProductType } from "@/types/user";
import { useProfile } from "@/hooks/useProfile";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  onClick?: () => void;
}

export function AppSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut } = useClerk();
  const { responses } = useResponses();
  const { orders } = useOrders();
  const { getMyRequirements } = useRequirements();
  const requirements = getMyRequirements();
  const [newResponseCount, setNewResponseCount] = useState(0);
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<any[]>([]);
  const [currentProductType, setCurrentProductType] = useState<ProductType>();
  const { profile } = useProfile();

  useEffect(() => {
    // Count new/unread responses
    const count = responses.length;
    setNewResponseCount(count);
    if (profile?.productType && profile.productType !== "Both") {
      setCurrentProductType(profile.productType);
    } else {
      setCurrentProductType("RCN")
    }
  }, [responses, profile?.productType]);

  // Load marketplace stocks from localStorage first, then refresh from API
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('marketplace_stocks') || '[]');
      if (Array.isArray(cached)) setStocks(cached);
    } catch {}

    const fetchStocks = async () => {
      try {
        const resp: any = await apiFetch('/api/stocks/get-all-stocks', { method: 'GET' });
        const list: any[] = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        // Normalize minimal fields we need for counting
        const mapped = list.map((s: any) => {
          const availableqty = Number(s?.availableqty ?? 0);
          const type = s?.type || 'RCN';
          const status = availableqty > 0 ? 'active' : 'out_of_stock';
          return { id: s?.id || s?._id, type, availableqty, status };
        });
        setStocks(mapped);
        localStorage.setItem('marketplace_stocks', JSON.stringify(mapped));
      } catch {
        // ignore
      }
    };
    fetchStocks();
  }, []);

  const activeProductsCount = stocks.filter(s => (s.status === 'active' || (s.availableqty ?? 0) > 0) && s.type === currentProductType).length;
  const ordersCount = orders.filter(order => order.productId && order.productId.trim() !== '').length;
  const mainNavItems: NavItem[] = [
    { path: "/", label: t('sidebar.mainNav.dashboard'), icon: Home },
    { path: "/marketplace", label: t('sidebar.mainNav.marketplace'), icon: Store, badge: activeProductsCount },
    { path: "/my-orders", label: t('sidebar.myActivity.myEnquiries'), icon: Mail, badge: ordersCount }

  ];



  const myActivityItems: NavItem[] = [
    // { path: "/my-requests", label: t('sidebar.myActivity.myRequests'), icon: MessageSquare, badge: 0 },
    // { path: "/messages", label: t('sidebar.myActivity.messages'), icon: Mail, badge: 0 },
    // { path: "/notifications", label: t('sidebar.myActivity.notifications'), icon: Bell, badge: 0 },
    // { path: "/profile", label: t('sidebar.myActivity.profile'), icon: User },
    { path: "/post-requirement", label: t('sidebar.mainNav.postRequirement'), icon: Plus, },
    { path: "/my-requirements", label: t('sidebar.myActivity.myRequirements'), icon: FileText, badge: requirements.length },
    { path: "/responses", label: t('sidebar.myActivity.sellerResponse'), icon: MessageSquare, badge: newResponseCount }
  ];

  const accountItems: NavItem[] = [
    {
      path: "#",
      label: t('sidebar.account.signOut'),
      icon: LogOut,
      onClick: () => signOut().then(() => navigate('/login'))
    },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-2 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent/50'}`;

  const collapsed = state === "collapsed";


  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="bg-[#F0F0F0]">
        {/* Logo */}
        <div className="p-[7.5px] border-b border-border">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="text-lg font-bold text-primary">Cashew Marketplace</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.mainNav.title')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[15px]">{item.label}</span>}
                      {item.badge !== undefined && item.badge > 0 && !collapsed && (
                        <Badge variant="destructive" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* My Activity */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.myActivity.title')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {myActivityItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={getNavCls}
                      onClick={item.onClick ? (e) => {
                        e.preventDefault();
                        item.onClick?.();
                      } : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[15px] flex-1">{item.label}</span>}
                      {item.badge !== undefined && item.badge > 0 && !collapsed && (
                        <Badge variant="destructive" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Actions */}
        <div className="mt-auto p-4 space-y-2">
          <RoleSwitcher />
          {accountItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}
              onClick={() => {
                item.onClick()
                // Clear all local storage data
                localStorage.clear();

                // Optionally clear sessionStorage too
                sessionStorage.clear();
              }}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </div>

        {/* <div className="mt-auto p-4 space-y-2">
          <Button variant="ghost" size="sm" className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}>
            <Bell size={16} />
            {!collapsed && (
              <>
                <span className="ml-2">Notifications</span>
                <Badge variant="destructive" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                  3
                </Badge>
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}>
            <User size={16} />
            {!collapsed && <span className="ml-2">Profile</span>}
          </Button>
            <Button
              variant="ghost"
              size="sm"
              className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}
              onClick={() => signOut()}   // 👈 sign out here
            >
              <LogOut size={16} />
              {!collapsed && <span className="ml-2">Logout</span>}
            </Button>
        </div> */}
      </SidebarContent>
    </Sidebar>
  );
}