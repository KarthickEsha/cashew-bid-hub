import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Boxes,
  ShoppingCart,
  MessageSquare,
  Package,
  Plus,
  ClipboardList,
  LogOut,
  CheckCircle,
  XCircle
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useRequirements } from "@/hooks/useRequirements";
import { useResponses } from "@/hooks/useResponses";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory"; 
import { ProductType } from "@/types/user";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import { extractBackendUserId } from "@/lib/profile";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My Stocks",
    url: "/merchant/products",
    icon: Package,   
  },
  // {
  //   title: "Add Product",
  //   url: "/merchant/add-product",
  //   icon: Plus,
  // },
  // {
  //   title: "Stock Enquiries",
  //   url: "/merchant/stock-response",
  //   icon: Boxes,
  // },
  {
    title: "Buyer Response",
    url: "/merchant/buyer-response",
    icon: MessageSquare,
  }

  // {
  //   title: "Requirements",
  //   url: "/merchant/requirements",
  //   icon: ClipboardList,
  // },
];

const buyerNavItems = [
  {
    title: "Buyer Enquiries",
    url: "/merchant/enquiries",
    icon: MessageSquare,
  },
  {
    title: "Confirm",
    url: "/merchant/confirmed-orders",
    icon: CheckCircle,
  },
  {
    title: "Rejected",
    url: "/merchant/rejected-orders",
    icon: XCircle,
  },
];

export function MerchantSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const currentPath = location.pathname;

  // Get dynamic counts
  const { getRequirementsAsEnquiries } = useRequirements();
  const { responses, getStockEnquiriesCount, getSellerResponseCount, ensureLoaded } = useResponses();

  const { orders } = useOrders();
  const { products } = useInventory(); 

  // Filter out skipped responses and get counts
  const activeResponses = responses.filter(r => r.status !== 'skipped');

  // Only show active enquiries (not expired and not completed)
  const activeEnquiries = getRequirementsAsEnquiries().filter(enquiry => {
    const expiryDate = new Date(enquiry.deliveryDeadline || 0);
    const now = new Date();
    return (
      expiryDate > now &&
      (enquiry.status === 'active' || enquiry.status === 'pending' || enquiry.status === 'viewed' || enquiry.status === 'accepted' || enquiry.status === "responded")
    );
  });

  // Only show selected (confirmed/accepted) responses
  const selectedResponses = activeResponses.filter(r => {
    const s = String(r.status).toLowerCase();
    return s === 'confirmed' || s === 'accepted';
  });
  const selectedRejectedResponses = activeResponses.filter(r => r.status === 'rejected');

  // Fallback count fetched from backend explicitly (some APIs may not include rejected in the main list)
  const [rejectedApiCount, setRejectedApiCount] = useState(0);
  const [confirmedApiCount, setConfirmedApiCount] = useState(0);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any = await apiFetch('/api/quotes/rejected');
        const arr = (data?.data ?? data) as any[];
        if (mounted) setRejectedApiCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        if (mounted) setRejectedApiCount(0);
      }
      try {
        const data: any = await apiFetch('/api/quotes/confirmed');
        const arr = (data?.data ?? data) as any[];
        if (mounted) setConfirmedApiCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        if (mounted) setConfirmedApiCount(0);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Count calculations
  const enquiriesCount = activeEnquiries.length;
  const confirmedCount = Math.max(selectedResponses.length, confirmedApiCount);
  const rejectedCount = Math.max(selectedRejectedResponses.length, rejectedApiCount);
  const ordersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const stockEnquiriesCount = getStockEnquiriesCount();
  const sellerResponseCount = getSellerResponseCount();
  const [currentProductType, setCurrentProductType] = useState<ProductType>();
  // Count from /api/stocks/enquiries
  const [buyerResponseCount, setBuyerResponseCount] = useState<number | null>(null);

  // Counts persisted by MerchantProducts
  const [stockCounts, setStockCounts] = useState<Record<string, { active: number; out_of_stock: number }>>({});
  const { profile } = useProfile();
  const STOCK_COUNTS_KEY = "stocks_counts_v1";
  useEffect(() => {
    if (profile?.productType && profile.productType !== "Both") {
      setCurrentProductType(profile.productType);
    } else {
      setCurrentProductType("RCN")
    }
  }, [profile?.productType]);

  // Ensure responses are loaded so counts can be shown by default and after role resolves
  useEffect(() => {
    ensureLoaded(true).catch(() => {});
  }, [profile?.role]);

  // Fetch Buyer Response count from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const view = 'merchant';
        const userID = extractBackendUserId() || (profile as any)?.id || '';
        const params = new URLSearchParams({ view });
        if (userID) params.set('userID', userID);
        const data: unknown = await apiFetch(`/api/stocks/enquiries?${params.toString()}`);
        const payload: unknown = (data as any)?.data ?? data;
        let count = 0;

        if (Array.isArray(payload)) {
          count = payload.length;
        } else if (payload && typeof payload === 'object' && 'count' in payload && typeof (payload as { count: unknown }).count === 'number') {
          count = (payload as { count: number }).count;
        }
        if (mounted) setBuyerResponseCount(count);
      } catch {
        if (mounted) setBuyerResponseCount(null);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Read counts from localStorage and keep in sync (no API re-fetch here)
  useEffect(() => {
    const readCounts = () => {
      try {
        const raw = localStorage.getItem(STOCK_COUNTS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.counts) setStockCounts(parsed.counts);
      } catch { /* ignore */ }
    };

    // Initial read
    readCounts();

    // Refresh when MerchantProducts updates counts
    const onStocksChanged = () => readCounts();
    window.addEventListener('stocks:changed', onStocksChanged as EventListener);

    // Cross-tab updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === STOCK_COUNTS_KEY) readCounts();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('stocks:changed', onStocksChanged as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // No API re-fetch on route change; counts come from MerchantProducts
  // Derive counts from persisted counts; fallback to local inventory if unavailable
  const typeKey = currentProductType || 'RCN';
  const activeProductsCount =
    stockCounts[typeKey]?.active ??
    products.filter(p => p.status === 'active' && (!currentProductType || p.type === currentProductType)).length;
  const outOfStockProductsCount =
    stockCounts[typeKey]?.out_of_stock ??
    products.filter(p => p.status === 'out_of_stock' && (!currentProductType || p.type === currentProductType)).length;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-purple-100 text-purple-700 font-medium" : "hover:bg-purple-50";

  const collapsed = state === "collapsed";

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className={`${collapsed ? "w-16" : "w-64"} border-purple-200`}>
      <SidebarContent className="bg-[#F0F0F0]">
        {/* Logo */}
        <div className="p-[7.5px] border-b border-purple-200">
          {!collapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <span className="text-lg font-bold text-purple-700">Merchant Portal</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">MP</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[15px]">{item.title}</span>}

                      {/* My Stocks counts */}
                      {item.url === "/merchant/products" && !collapsed && activeProductsCount > 0 && (
                        <div className="flex gap-1 ml-auto">
                          <Badge variant="outline" className="px-1 h-5 text-xs font-normal">
                            {activeProductsCount}
                          </Badge>
                          {outOfStockProductsCount > 0 && (
                            <Badge variant="destructive" className="px-1 h-5 text-xs font-normal">
                              {outOfStockProductsCount}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Buyer/Seller Response counts */}
                      {item.url === "/merchant/buyer-response" && !collapsed && (
                        <Badge variant="secondary" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {buyerResponseCount ?? sellerResponseCount}
                        </Badge>
                      )}

                      {/* Stock Enquiries count */}
                      {item.url === "/merchant/stock-response" && !collapsed && stockEnquiriesCount > 0 && (
                        <Badge variant="secondary" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {stockEnquiriesCount}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Buyer Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Buyer Activity</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buyerNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-[15px]">{item.title}</span>}

                      {/* Enquiries count */}
                      {item.url === "/merchant/enquiries" && !collapsed && enquiriesCount > 0 && (
                        <Badge variant={enquiriesCount > 0 ? "destructive" : "outline"}
                          className="ml-auto px-1.5 h-5 text-xs font-normal">
                          {enquiriesCount}
                        </Badge>
                      )}

                      {/* Confirmed Orders count */}
                      {item.url === "/merchant/confirmed-orders" && !collapsed && confirmedCount > 0 && (
                        <Badge variant={confirmedCount > 0 ? "secondary" : "outline"}
                          className="ml-auto px-1.5 h-5 text-xs font-normal">
                          {confirmedCount}
                        </Badge>
                      )}

                      {/* Rejected Orders count */}
                      {item.url === "/merchant/rejected-orders" && !collapsed && rejectedCount > 0 && (
                        <Badge variant={rejectedCount > 0 ? "secondary" : "outline"}
                          className="ml-auto px-1.5 h-5 text-xs font-normal">
                          {rejectedCount}
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
          <Button
            variant="ghost"
            size="sm"
            className={collapsed ? "w-8 h-8 p-0" : "w-full justify-start"}
            onClick={() => {
              signOut()
              // Clear all local storage data
              localStorage.clear();

              // Optionally clear sessionStorage too
              sessionStorage.clear();
            }

            }
          >
            <LogOut size={16} />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}