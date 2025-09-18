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

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
   {
    title: "My Stocks",
    url: "/merchant/products",
    icon: Package,   // 👈 changed from Package to Boxes
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
  const { responses, getStockEnquiriesCount } = useResponses();
  const { orders } = useOrders();

  // Filter out skipped responses and get counts
  const activeResponses = responses.filter(r => r.status !== 'skipped');
  
  // Only show active enquiries (not expired and not completed)
  const activeEnquiries = getRequirementsAsEnquiries().filter(enquiry => {
    const expiryDate = new Date(enquiry.deliveryDeadline || 0);
    const now = new Date();
    return expiryDate > now && enquiry.status === 'active' || enquiry.status === 'responded' || enquiry.status === 'selected' || enquiry.status === 'viewed';
  });
  
  // Only show selected (accepted) responses
  const selectedResponses = activeResponses.filter(r => r.status === 'accepted');

  const selectedRejectedResponses = activeResponses.filter(r => r.status === 'rejected');
  
  const enquiriesCount = activeEnquiries.length;
  const confirmedCount = selectedResponses.length;
  const rejectedCount = selectedRejectedResponses.length; // Don't show rejected count in sidebar
  const ordersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const stockEnquiriesCount = getStockEnquiriesCount();

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
                      {item.url === "/merchant/stock-response" && !collapsed && stockEnquiriesCount > 0 && (
                        <Badge variant="secondary" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {stockEnquiriesCount}
                        </Badge>
                      )}
                      {item.url === "/merchant/buyer-response" && !collapsed && ordersCount > 0 && (
                        <Badge variant="secondary" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {ordersCount}
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
                      {item.url === "/merchant/enquiries" && !collapsed && enquiriesCount > 0 && (
                        <Badge variant="destructive" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {enquiriesCount}
                        </Badge>
                      )}
                      {item.url === "/merchant/confirmed-orders" && !collapsed && confirmedCount > 0 && (
                        <Badge variant="secondary" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          {confirmedCount}
                        </Badge>
                      )}
                      {item.url === "/merchant/rejected-orders" && !collapsed && rejectedCount > 0 && (
                        <Badge variant="secondary" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
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
            onClick={() => signOut()}
          >
            <LogOut size={16} />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}