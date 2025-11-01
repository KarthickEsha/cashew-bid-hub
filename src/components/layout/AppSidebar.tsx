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
import { useEffect, useState, useCallback } from "react";
import { useResponses } from "@/hooks/useResponses";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useTranslation } from "react-i18next";
import { useOrders } from "@/hooks/useOrders";
import { useRequirements } from "@/hooks/useRequirements";
import { apiFetch } from "@/lib/api";
import { ProductType } from "@/types/user";
import { useProfile } from "@/hooks/useProfile";
import { extractBackendUserId } from "@/lib/profile";

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
  const { responses, ensureLoaded, getSellerResponseCount } = useResponses() as any;
  const { orders } = useOrders();
  const { getMyRequirements, fetchAllRequirements } = useRequirements();
  const requirements = getMyRequirements();
  const [newResponseCount, setNewResponseCount] = useState(0);
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<any[]>([]);
  const [currentProductType, setCurrentProductType] = useState<ProductType>();
  const { profile } = useProfile();
  const [merchant, setMerchant] = useState<{
    id: string;
    name: string;
    rating?: number;
    totalOrders?: number;
    location: string | Location;
    verified?: boolean;
    responseTime?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
  } | null>(null);
  // My Enquiries (orders) count from backend
  const [myEnquiriesCount, setMyEnquiriesCount] = useState<number>(0);

  useEffect(() => {
    // Count seller responses from store helper (fallbacks handled inside hook)
    if (profile?.productType && profile.productType !== "Both") {
      setCurrentProductType(profile.productType);
    } else {
      setCurrentProductType("RCN")
    }
  }, [responses, getSellerResponseCount, profile?.productType]);
  
  



  // Fetch seller response count directly from API so badge reflects backend total (merchant view)
 useEffect(() => {
  const fetchNewResponsesCount = async () => {
    try {
      const view = 'buyer';
      const userID = extractBackendUserId() || (profile as any)?.id || '';
      const params = new URLSearchParams({ view });
      if (userID) params.set('userID', userID);

      // Fetch all quotes
      const data: any = await apiFetch(`/api/quotes/get-all-quotes?${params.toString()}`, {
        method: 'GET'
      });

      // Process the response
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      
      // Count only quotes with status 'new'
      const newQuotesCount = list.filter((quote: any) => 
        String(quote.status || '').toLowerCase() === 'new'
      ).length;

      setNewResponseCount(newQuotesCount);
    } catch (e) {
      console.error('Failed to fetch new quotes count:', e);
      // Keep existing count on error
    }
  };

  // Initial fetch
  fetchNewResponsesCount();

  // Set up event listener for status changes
  const handleStatusChange = (e: any) => {
    console.log('Status change event received:', e.detail);
    
    // Handle both direct event and CustomEvent with detail
    const detail = e.detail || e;
    const { status, oldStatus } = detail || {};
    
    if (status === undefined || oldStatus === undefined) {
      console.warn('Missing status or oldStatus in event detail:', detail);
      return;
    }

    console.log(`Status changed from '${oldStatus}' to '${status}'`);

    // Update count based on status change
    setNewResponseCount(prev => {
      // Normalize status values to lowercase for comparison
      const newStatus = String(status).toLowerCase().trim();
      const prevStatus = String(oldStatus).toLowerCase().trim();
      
      console.log(`Updating count - Previous status: '${prevStatus}', New status: '${newStatus}'`);
      
      // Handle both 'new' and 'New' status values
      const wasNew = prevStatus === 'new';
      const isNew = newStatus === 'new';
      
      if (!wasNew && isNew) {
        const newCount = prev + 1;
        console.log(`Incrementing count from ${prev} to ${newCount}`);
        return newCount;
      } 
      else if (wasNew && !isNew) {
        const newCount = Math.max(0, prev - 1);
        console.log(`Decrementing count from ${prev} to ${newCount}`);
        return newCount;
      }
      
      console.log(`No count change needed - Previous status: '${prevStatus}', New status: '${newStatus}'`);
      return prev;
    });
  };

  // Add event listeners to both window and document
  const eventName = 'quote:statusChange';
  window.addEventListener(eventName, handleStatusChange as EventListener);
  document.addEventListener(eventName, handleStatusChange as EventListener);
  
  console.log('Added event listeners for', eventName);
  
  // Cleanup
  return () => {
    window.removeEventListener(eventName, handleStatusChange as EventListener);
    document.removeEventListener(eventName, handleStatusChange as EventListener);
    console.log('Removed event listeners for', eventName);
  };
}, [profile?.id]);  // Only re-run if profile.id changes

  // Ensure seller responses are loaded once from API and persisted
  useEffect(() => {
    // Load only once on mount
    ensureLoaded?.().catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure requirements are fetched so badge shows by default
  useEffect(() => {
    fetchAllRequirements?.().catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable fetcher for My Enquiries count (avoids races, supports refetch triggers)
  const fetchMyEnquiriesCount = useCallback(async () => {
    const ac = new AbortController();
    try {
      const view = 'buyer';
      const params = new URLSearchParams({ view });
      params.set('ownOnly', "true");
      const res: any = await apiFetch(`/api/stocks/enquiries?${params.toString()}`, {
        method: 'GET',
        signal: ac.signal
      });

      const payload: unknown = (res as any)?.data ?? res;
      let count = 0;

      if (Array.isArray(payload)) {
        // Only count enquiries with status "processing"
        count = payload.filter((enquiry: any) =>
          enquiry.status && typeof enquiry.status === 'string' &&
          (enquiry.status.toLowerCase() === 'confirmed' || enquiry.status.toLowerCase() === 'rejected')
        ).length;
      } else if (
        payload &&
        typeof payload === 'object' &&
        'count' in payload &&
        typeof (payload as any).count === 'number'
      ) {
        // If we get a count directly, we can't filter by status
        // So we'll use the count as is, but you might want to handle this case differently
        count = (payload as any).count;
      }

      setMyEnquiriesCount(count);
      try {
        localStorage.setItem('myEnquiries:lastCount', String(count));
      } catch (e) {
        console.warn('Failed to save count to localStorage', e);
      }
    } catch (e) {
      console.error('Failed to fetch enquiries count', e);
      // Keep last known count on error
    }

    return () => ac.abort();
  }, []);

  // Listen for new enquiry events to refresh the count
  useEffect(() => {
    const handleEnquiryCreated = () => {
      fetchMyEnquiriesCount().catch(console.error);
    };

    window.addEventListener('enquiry:created', handleEnquiryCreated);
    return () => {
      window.removeEventListener('enquiry:created', handleEnquiryCreated);
    };
  }, [fetchMyEnquiriesCount]);

  // Initialize My Enquiries count once across the app (guards unmount/mount on route change)
  useEffect(() => {
    const INIT_KEY = 'myEnquiries:init';
    const COUNT_CACHE_KEY = 'myEnquiries:lastCount';

    // Hydrate from cache if available, then always refetch on every mount for freshness
    try {
      const cached = localStorage.getItem(COUNT_CACHE_KEY);
      if (cached !== null) setMyEnquiriesCount(Number(cached) || 0);
    } catch { }

    // Always trigger a fetch on mount to ensure the latest count
    (async () => { await fetchMyEnquiriesCount(); })();

    // Register listeners only once across the session
    if (sessionStorage.getItem(INIT_KEY) !== '1') {
      sessionStorage.setItem(INIT_KEY, '1');

      const onFocus = () => { fetchMyEnquiriesCount(); };
      const onVisibility = () => { if (!document.hidden) fetchMyEnquiriesCount(); };
      const onEnquiryCreated = () => { fetchMyEnquiriesCount(); };

      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('enquiry:created', onEnquiryCreated);

      return () => {
        // Keep INIT_KEY so we don't re-add listeners; remove only the ones we added in this mount
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('enquiry:created', onEnquiryCreated);
      };
    }
    // If listeners already initialized, no cleanup necessary here
    return;
  }, [fetchMyEnquiriesCount]);

  // Load marketplace stocks from localStorage (per type), then refresh from API with type
  useEffect(() => {
    if (!currentProductType) return;
    const cacheKey = `marketplace_stocks_${currentProductType}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      if (Array.isArray(cached)) setStocks(cached);
    } catch { }

    const fetchStocks = async () => {
      try {
        const role = String(profile?.role || '').toLowerCase();
        const view = role === 'processor' ? 'merchant' : 'buyer';
        const baseUrl = `/api/stocks/get-all-stocks?type=${encodeURIComponent(currentProductType)}&view=${view}`;
        const url = role === 'processor' && profile?.id ? `${baseUrl}&userId=${encodeURIComponent(profile.id)}` : baseUrl;
        const resp: any = await apiFetch(url, { method: 'GET' });
        const list: any[] = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        // Normalize minimal fields we need for counting
        const mapped = list.map((s: any) => {
          const availableqty = Number(s?.availableqty ?? 0);
          const rawType = String(s?.type ?? 'RCN');
          const type = rawType.toLowerCase().startsWith('kern') ? 'Kernel' : 'RCN';
          const status = availableqty > 0 ? 'active' : 'out_of_stock';
          return { id: s?.id || s?._id, type, availableqty, status };
        });
        setStocks(mapped);
        localStorage.setItem(cacheKey, JSON.stringify(mapped));
      } catch {
        // ignore
      }
    };
    fetchStocks();
  }, [currentProductType]);

  const activeProductsCount = stocks.filter(
    s => (s.status === 'active' || (s.availableqty ?? 0) > 0) && s.type === currentProductType
  ).length;
  const ordersCount = orders.filter(order => order.productId && order.productId.trim() !== '').length;
  const myEnquiriesBadge = myEnquiriesCount;

  const mainNavItems: NavItem[] = [
    { path: "/", label: t('sidebar.mainNav.dashboard'), icon: Home },
    { path: "/marketplace", label: t('sidebar.mainNav.marketplace'), icon: Store, badge: activeProductsCount },
    { path: "/my-orders", label: t('sidebar.myActivity.myEnquiries'), icon: Mail, badge: myEnquiriesBadge }

  ];

  const myActivityItems: NavItem[] = [
    // { path: "/my-requests", label: t('sidebar.myActivity.myRequests'), icon: MessageSquare, badge: 0 },
    // { path: "/messages", label: t('sidebar.myActivity.messages'), icon: Mail, badge: 0 },
    // { path: "/notifications", label: t('sidebar.myActivity.notifications'), icon: Bell, badge: 0 },
    // { path: "/profile", label: t('sidebar.myActivity.profile'), icon: User },
    { path: "/post-requirement", label: t('sidebar.mainNav.postRequirement'), icon: Plus, },
    { path: "/my-requirements", label: t('sidebar.myActivity.myRequirements'), icon: FileText, badge: 0 },
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