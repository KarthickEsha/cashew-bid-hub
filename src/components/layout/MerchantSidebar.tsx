import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  MessageSquare,
  Package,
  Plus,
  ClipboardList,
  LogOut
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
  {
    title: "Orders",
    url: "/merchant/orders",
    icon: ShoppingCart,
  },
  // {
  //   title: "Requirements",
  //   url: "/merchant/requirements",
  //   icon: ClipboardList,
  // },
];

const buyerNavItems = [
  {
    title: "Enquiries",
    url: "/merchant/enquiries",
    icon: MessageSquare,
  },
  {
    title: "Confirm",
    url: "/merchant/enquiries?status=confirmed",
    icon: MessageSquare,
  },
  {
    title: "Rejected",
    url: "/merchant/enquiries?status=rejected",
    icon: MessageSquare,
  },
];

export function MerchantSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const currentPath = location.pathname;

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
                      {item.url === "/merchant/orders" && !collapsed && (
                        <Badge variant="secondary" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          3
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
                      {item.url === "/merchant/enquiries" && !collapsed && (
                        <Badge variant="destructive" className="ml-auto px-1 min-w-[16px] h-4 text-xs">
                          5
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